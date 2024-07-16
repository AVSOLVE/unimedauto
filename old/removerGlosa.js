const fs = require('fs').promises;
const logColors = require('ansi-colors');
const { loginAuth } = require('../shared/loginAuth');

async function redirectToContasMedicas(page) {
  const frame = page
    .frameLocator('iframe >> nth=0')
    .frameLocator('#principal')
    .frameLocator('td iframe');
  await frame
    .frameLocator('frame >> nth=0')
    .getByText('Digitação de contas médicas')
    .click();
  await frame
    .frameLocator('frame >> nth=0')
    .getByText('» Digitar conta médica')
    .click();
  await frame
    .frameLocator('#paginaPrincipal')
    .getByRole('link', { name: 'Utilizar' })
    .first()
    .click();

    console.log('Routed in!');
}

// (async () => {
//   const { page, browser } = await loginAuth();
//   page.on('dialog', async (dialog) => {
//     const logMessage = `===> ${dialog.message()}`;
//     // await dialog.dismiss();
//     await dialog.accept();
//     console.log(logColors.bgBlueBright(logMessage));
//   });
//   page.on('popup', async (popup) => {
//     await popup.waitForLoadState();
//     popup.close();
//   });
//   // await processCSV(page);
// })();

(async () => {
  try {
    const { page, browser } = await loginAuth();
    await redirectToContasMedicas(page);

    const frame = page
      .frameLocator('iframe >> nth=0')
      .frameLocator('#principal')
      .frameLocator('td iframe')
      .frameLocator('#paginaPrincipal');

    for (let i = 90; i > 0; i--) {
      try {
        const condition = await frame
          .locator(`tr:nth-child(${i}) > td:nth-child(7)`)
          .innerText();

        if (condition.trim() === 'Possui inconsistências') {
          console.log(`Row ${i}: Condition met. Performing actions...`);
          await frame.locator(`tr:nth-child(${i}) > td:nth-child(9)`).click();
          await frame.getByRole('button', { name: 'Proc/Mat' }).click();
          await frame.getByRole('img', { name: 'Alterar serviço' }).click();
        } else {
          console.log(`Row ${i}: Condition not met.`);
        }
      } catch (error) {
        console.error(`Error processing row ${i}:`, error);
      }
    }
    browser.close();
    // await page.frameLocator('#divPadrao #frameModal').locator('#dt_realizacao').click();
    // page.once('dialog', dialog => {
    //   console.log(`Dialog message: ${dialog.message()}`);
    //   dialog.dismiss().catch(() => {});
    // });
    // await page.frameLocator('#divPadrao #frameModal').getByRole('button', { name: 'Salvar' }).click();
    // page.once('dialog', dialog => {
    //   console.log(`Dialog message: ${dialog.message()}`);
    //   dialog.dismiss().catch(() => {});
    // });
    // await page.frameLocator('iframe >> nth=0').frameLocator('#principal').frameLocator('td iframe').frameLocator('#paginaPrincipal').getByRole('button', { name: 'Consistir' }).click();
    // await page.frameLocator('iframe >> nth=0').frameLocator('#principal').frameLocator('td iframe').frameLocator('#paginaPrincipal').getByRole('button', { name: 'Voltar' }).click();
    // page.once('dialog', dialog => {
    //   console.log(`Dialog message: ${dialog.message()}`);
    //   dialog.dismiss().catch(() => {});
    // });
    // await page.frameLocator('iframe >> nth=0').frameLocator('#principal').frameLocator('td iframe').frameLocator('#paginaPrincipal').getByRole('button', { name: 'Consistir' }).click();
    // await page.frameLocator('iframe >> nth=0').frameLocator('#principal').frameLocator('td iframe').frameLocator('#paginaPrincipal').getByRole('button', { name: 'Voltar' }).click();
    // await page.frameLocator('iframe >> nth=0').frameLocator('#principal').frameLocator('td iframe').frameLocator('#paginaPrincipal').getByRole('row', { name: '6578112 11450574 17/06/2024' }).getByRole('link').click();
    // await page.frameLocator('iframe >> nth=0').frameLocator('#principal').frameLocator('td iframe').frameLocator('#paginaPrincipal').getByRole('button', { name: 'Proc/Mat' }).click();
    // await page.frameLocator('iframe >> nth=0').frameLocator('#principal').frameLocator('td iframe').frameLocator('#paginaPrincipal').getByRole('img', { name: 'Alterar serviço' }).click();
    // await page.frameLocator('#divPadrao #frameModal').locator('#dt_realizacao').click();
    // await page.frameLocator('#divPadrao #frameModal').getByRole('img', { name: '...' }).click();
    // await page.frameLocator('#divPadrao #frameModal').getByRole('link', { name: '3', exact: true }).click();
    // page.once('dialog', dialog => {
    //   console.log(`Dialog message: ${dialog.message()}`);
    //   dialog.dismiss().catch(() => {});
    // });

    // await page.frameLocator('#divPadrao #frameModal').locator('#dt_realizacao').fill('03/06/245445');

    // await page.frameLocator('#divPadrao #frameModal').getByRole('button', { name: 'Salvar' }).click();
    // await page.getByRole('link', { name: 'Fechar' }).click();

  } catch (error) {
    console.error('Login process failed:', error);
  }
})();
