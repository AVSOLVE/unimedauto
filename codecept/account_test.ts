Feature('account');

Scenario('test something', ({ I }) => {
  I.amOnPage('https://portal.unimedpalmas.coop.br/');
  
  I.fillField('username', 'your-username');
  I.fillField('password', 'your-password');
  I.click('Login');
  I.see('Welcome', '.welcome-message');
});
