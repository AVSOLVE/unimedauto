const fs = require('fs').promises;
const { chromium } = require('playwright');

function textBeforeFirstDot(email) {
  const regex = /^[^.]+/;
  const match = email.match(regex);
  return match ? match[0] : 'No dot found in the email address';
}

(async () => {
  try {
    const fileContent = await fs.readFile('trocar senha.csv', 'utf-8');
    const lines = fileContent.trim().split('\n');

    for (const line of lines) {
      const [nomeAluno, login, senha] = line.trim().split(';');
      const novaSenha = textBeforeFirstDot(login) + senha.substring(1, senha.length);
      console.clear();
      console.log(`${nomeAluno} - ${login} - ${senha}`);

      const browser = await chromium.launch({ headless: false });
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.setViewportSize({ width: 800, height: 600 });

      await page.goto('https://accounts.google.com/servicelogin?hl=pt-br');
      await page.getByLabel('E-mail ou telefone').fill(login);
      await page.getByRole('button', { name: 'Avançar' }).click();
      await page.getByLabel('Digite sua senha').fill(senha);
      await page.getByRole('button', { name: 'Avançar' }).click();

      try {
        if (page.getByRole('button', { name: 'Entendi' })) {
          await page.getByRole('button', { name: 'Entendi' }).click();
          await page.getByLabel('Criar senha').fill(novaSenha);
          await page.getByLabel('Confirmar senha').fill(novaSenha);
          await page.getByRole('button', { name: 'Alterar senha' }).click();
        } else {
          await page.getByLabel('Criar uma senha').click();
          await page.getByLabel('Criar uma senha').fill(novaSenha);
          await page.getByLabel('Confirmar').fill(novaSenha);
          await page.getByRole('button', { name: 'Próxima' }).click();
        }
      } catch (error) {
        console.error('An error occurred during the password change process:', error);
      }

      await fs.appendFile('alunos_nova_senha.csv', `${nomeAluno};${login};${senha};${novaSenha}\n`);
      await browser.close();
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
})();
