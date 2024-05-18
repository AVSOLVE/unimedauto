const fs = require('fs').promises;
const { chromium } = require('playwright');

(async () => {
  console.clear();
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.setViewportSize({ width: 1024, height: 680 });
  page.setDefaultTimeout(10000);

  await page.goto('https://script.google.com/a/macros/seduc.to.gov.br/s/AKfycbx-DugFOZM9BsMxbRUO3dio3WQBiQKqqPEz6oHhuqmf34hgtoiKxdn6PpZoPrrWhL0e3Q/exec');

  await page
    .getByLabel('Enter your email')
    .fill('juscelinodeoliveira@ue.seduc.to.gov.br');

  await page
    .locator('div')
    .filter({
      hasText:
        'Sign inUse your Google AccountEnter your email@seduc.to.gov.brForgot email?Type',
    })
    .first()
    .click();
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByLabel('Enter your password').fill('admjk2022');
  await page.getByRole('button', { name: 'Next' }).click();

  await page.waitForTimeout(10000);

  const fileContent = await fs.readFile('trocar senha.csv', 'utf-8');
  const lines = fileContent.trim().split('\n');

  for (const [index, line] of lines.entries()) {
    const [nomeAluno, login, senha] = line.trim().split(';');

    console.log(`${nomeAluno} - ${login} - ${senha}`);

    await page
      .frameLocator('#sandboxFrame')
      .frameLocator('#userHtmlFrame')
      .getByPlaceholder('Ex. jose@aluno.seduc.to.gov.br')
      .click();

    await page
      .frameLocator('#sandboxFrame')
      .frameLocator('#userHtmlFrame')
      .getByPlaceholder('Ex. jose@aluno.seduc.to.gov.br')
      .fill(login);

    await page
      .frameLocator('#sandboxFrame')
      .frameLocator('#userHtmlFrame')
      .getByPlaceholder('Ex. jose@aluno.seduc.to.gov.br')
      .press('Tab');

    await page
      .frameLocator('#sandboxFrame')
      .frameLocator('#userHtmlFrame')
      .getByPlaceholder('Mínimo de 8 digitos')
      .fill(senha);

    await page
      .frameLocator('#sandboxFrame')
      .frameLocator('#userHtmlFrame')
      .getByPlaceholder('Mínimo de 8 digitos')
      .press('Tab');

    await page
      .frameLocator('#sandboxFrame')
      .frameLocator('#userHtmlFrame')
      .getByPlaceholder('Repita a sua nova senha')
      .fill(senha);

    await page
      .frameLocator('#sandboxFrame')
      .frameLocator('#userHtmlFrame')
      .getByRole('button', { name: 'Enviar' })
      .click();

    await page
      .frameLocator('#sandboxFrame')
      .frameLocator('#userHtmlFrame')
      .getByRole('button', { name: 'Fechar' })
      .click();
  }
  browser.close();
})();