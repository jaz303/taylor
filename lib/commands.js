var commands = module.exports = {};

function registerCommand(name, cmdOpts) {
    commands[name] = function(pkg, options) {

        if (cmdOpts.package === true && !pkg) {
            throw new Error("this command must be run in a package context");
        } else if (cmdOpts.package === false && pkg) {
            throw new Error("this command cannot be run in a package context");
        }

        return cmdOpts.handler(pkg, options);

    }
}

registerCommand('create-app', {
    handler         : require('./handlers/create_app'),
    package         : false
});

registerCommand('create-module', {
    handler         : require('./handlers/create_module')
});

registerCommand('install', {
    handler         : require('./handlers/install_package'),
    package         : true
});

registerCommand('build', {
    handler         : require('./handlers/build_package'),
    package         : true
});

registerCommand('run', {
    handler         : require('./handlers/run_app_target'),
    package         : true
});

registerCommand('clean', {
    handler         : require('./handlers/make_clean'),
    package         : true
});

registerCommand('zap', {
    handler         : require('./handlers/zap_package'),
    package         : true
});

registerCommand('make', {
    handler         : require('./handlers/build_make_target'),
    package         : true
});

registerCommand('regen', {
    handler         : require('./handlers/regenerate'),
    package         : true
});

registerCommand('invalidate', {
    handler         : require('./handlers/invalidate_package'),
    package         : true
});

registerCommand('config', {
    handler         : require('./handlers/dump_config'),
    package         : true
});

registerCommand('env', {
    handler         : require('./handlers/dump_environment'),
    package         : true
});