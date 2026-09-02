import './ui/scss/style.scss';
import { version as pcuiVersion, revision as pcuiRevision } from '@playcanvas/pcui';
import { version as stVersion, revision as stRevision } from '@playcanvas/splat-transform';
import { version as engineVersion, revision as engineRevision } from 'playcanvas';

import { main } from './main';
import { version as appVersion } from '../package.json';

// print out versions of dependent packages
// NOTE: add dummy style reference to prevent tree shaking
console.log(`SuperSplat v${appVersion} | SplatTransform v${stVersion} (${stRevision}) | Engine v${engineVersion} (${engineRevision}) | PCUI v${pcuiVersion} (${pcuiRevision})`);
 
main();



setTimeout(()=>{//xzw add
    const urlParams = new URL(location.href).searchParams 
    if(urlParams.get('gui') != void 0){
        document.querySelector('#menu').style.display = 'block'
        
        document.querySelector('#right-toolbar').style.display = 'block'
    }
},2000)
