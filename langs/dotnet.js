'use strict';
const LangHelper = require('./base');
const { spawnSync } = require('child_process');

class DotNetHelper extends LangHelper {
    runtime() {
        return this.langStrings()[0];
    }

    langStrings() {
        return ['dotnet', 'dotnet6'];
    }
    extensions() {
        return ['.cs', '.fs'];
    }
    buildFromImage() {
        return 'mcr.microsoft.com/dotnet/sdk:6.0';
    }
    runFromImage() {
        return 'mcr.microsoft.com/dotnet/runtime:6.0';
    }

    dockerfileBuildCmds() {
        const cmds = [];
        cmds.push('ADD . .');

        return cmds
    }

    dockerfileCopyCmds() {
        const cmds = [];
        cmds.push('COPY --from=build-stage /function/output .');

        return cmds
    }

    entrypoint() {
        return 'dotnet dotnet.dll';
    }

    hasPreBuild() {
        return true;
    }

    // PreBuild for Go builds the binary so the final image can be as small as possible
    preBuild() {
        const wd = process.cwd();

        const args = [
            'run',
            '--rm', '-v',
            `${wd}:/dotnet`, '-w', '/dotnet',
            'mcr.microsoft.com/dotnet/sdk:6.0',
            '/bin/sh', '-c',
            'dotnet restore && dotnet publish -c release -b /tmp -o .',
        ];

        const res = spawnSync('docker', args, { stdio: 'inherit' });
        if (res.status !== 0) {
            throw new Error('failed to run prebuild command:', args);
        }
    }

    afterBuild() {

    }

}

module.exports = DotNetHelper;
