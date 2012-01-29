var share = {},
  action = require('launch')(share).action;


desc('Deploy the current branch to the live environment');
task('deploylive', ['setenvlive', 'launch:symlink', 'restart'], function () {
});

desc('Deploy the current branch to the development environment');
task('deploydev', ['setenvdev', 'launch:symlink', 'restart'], function () {
});

desc('Sets the environment to development');
task('setenvdev', ['launch:info'], function () {
  share.env = 'dev';
});

desc('Sets the environment to live');
task('setenvlive', ['launch:info'], function () {
  share.env = 'live';
});

desc('Restarts the server given an `env`');
task('restart', function () {

  if (!share.env) {
    action.error('`env` is not set.');
    fail();
  }

  action.remote(share.info.remote,
    'NODE_ENV=production forever stop /var/w/' + share.env + '/' + share.info.name + '/site/app.js && NODE_ENV=production forever start /var/w/' + share.env + '/' + share.info.name + '/site/app.js', function (exitcode) {
      if (exitcode === 0) {
        action.notice('The site service restarted.');
        action.notice('Check manually to verify that the site is running.')
      } else {
        action.error('Failed to restart site');
        fail();
      }
    });

}, true);

desc('Restarts the live instance');
task('restartlive', ['setenvlive', 'restart'], function () {
});
