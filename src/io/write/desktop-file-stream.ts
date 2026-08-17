const requestParentAction = (type: string, data: Record<string, unknown> = {}, transfer: ArrayBuffer[] = []) => {
    if (window.parent === window) {
        throw new Error('客户端文件能力不可用');
    }

    return new Promise<any>((resolve, reject) => {
        const timeout = { id: 0 };
        const onMessage = (event: MessageEvent) => {
            if (event.source !== window.parent || event.data?.type !== `${type}-result`) {
                return;
            }

            window.clearTimeout(timeout.id);
            window.removeEventListener('message', onMessage);

            if (event.data.success === false) {
                reject(new Error(event.data.message || `客户端文件操作失败: ${type}`));
            } else {
                resolve(event.data.data);
            }
        };

        window.addEventListener('message', onMessage);
        timeout.id = window.setTimeout(() => {
            window.removeEventListener('message', onMessage);
            reject(new Error(`客户端文件操作超时: ${type}`));
        }, 30000);
        window.parent.postMessage({ type, data }, '*', transfer);
    });
};

class DesktopWritableStream {
    private streamId: string;
    private closed = false;

    private constructor(streamId: string) {
        this.streamId = streamId;
    }

    static async open(filename: string): Promise<DesktopWritableStream> {
        const result = await requestParentAction('file-open', { filename });
        if (!result?.streamId) {
            throw new Error('客户端文件流创建失败');
        }
        return new DesktopWritableStream(result.streamId);
    }

    seek(position: number): Promise<void> {
        if (position !== 0) {
            return Promise.reject(new Error('客户端文件流不支持随机定位'));
        }
        return Promise.resolve();
    }

    async write(data: Uint8Array): Promise<void> {
        if (this.closed) {
            throw new Error('客户端文件流已关闭');
        }

        const buffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
        await requestParentAction('file-write', { streamId: this.streamId, buffer }, [buffer]);
    }

    async truncate(_size: number): Promise<void> {
        // The parent creates a new file and receives each write sequentially.
    }

    async close(): Promise<void> {
        if (this.closed) return;
        await requestParentAction('file-close', { streamId: this.streamId });
        this.closed = true;
    }

    async abort(): Promise<void> {
        if (this.closed) return;
        try {
            await requestParentAction('file-abort', { streamId: this.streamId });
        } catch {
            // The parent may already have closed while the export was failing.
        }
        this.closed = true;
    }
}

const createDesktopFileStream = async (filename: string): Promise<FileSystemWritableFileStream> => {
    const stream = await DesktopWritableStream.open(filename);
    return stream as unknown as FileSystemWritableFileStream;
};

const isDesktopFileBridgeAvailable = () => window.parent !== window;

export { createDesktopFileStream, isDesktopFileBridgeAvailable };
