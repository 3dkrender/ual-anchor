import * as pkg from './AnchorBundlerExport'

const UALAnchor = pkg.default;

for (const key of Object.keys(pkg)) {
    if (key === 'default') continue
    UALAnchor[key] = pkg[key]
}

export default UALAnchor;
