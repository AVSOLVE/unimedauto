const { loginAuth } = require('../shared/loginAuth');
const { logMessage, retry, matchCode } = require('../shared/helper');
const today = new Date().toLocaleDateString('pt-BR');
let accountNumbers = [1];
let foundAny = false;

async function loginAndNavigate() {
  const { page, browser } = await loginAuth();
  const execute = async () => {
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
  };
  try {
    await retry(execute);
    console.clear();
    logMessage('green', 'REDIRECIONANDO! AGUARDE...');
    return { page, browser };
  } catch (error) {
    logMessage('yellow', `O REDIRECIONAMENTO FALHOU! ${error.message}!`);
    throw error;
  }
}

async function getMainFrame(page) {
  return page
    .frameLocator('iframe >> nth=0')
    .frameLocator('#principal')
    .frameLocator('td iframe')
    .frameLocator('#paginaPrincipal');
}

async function createBatch(frame) {
  await frame.getByRole('button', { name: 'Criar protocolo' }).click();
  await frame.locator('#dt_referencia').fill(today);
  await frame.locator('#ie_tipo_guia').selectOption('4');
  await frame.getByRole('button', { name: 'Salvar' }).click();
}

async function manageBatch(page, frame) {
  try {
    await frame
      .getByRole('link', { name: 'Finalizar protocolo' })
      .last()
      .click();

    if (accountNumbers.length > 0) {
      await frame.getByRole('link', { name: 'Utilizar' }).last().click();

      for (const accountNumber of accountNumbers) {
        console.log(`Processing account number: ${accountNumber}`);
        const rows = await frame.locator('tr.registroLista');
        const rowsCount = await rows.count();

        for (let i = 0; i < rowsCount; i++) {
          const text = await rows.nth(i).locator('td').first().textContent();
          if (text.includes(accountNumber)) {
            console.log(`Account number ${accountNumber} found.`);
            await rows.nth(i).locator('td:nth-child(9)').click();
            await frame.getByRole('button', { name: 'Proc/Mat' }).click();

            const description = await frame
              .locator('tr.registroLista')
              .nth(2)
              .locator('td:nth-child(2)')
              .textContent();

            const value = await matchCode(description.trim());
            logMessage(
              'white',
              `Matching value to ${description.trim()}: ${value}`
            );

            if (value !== null && value !== undefined) {
              await frame.getByRole('img', { name: 'Alterar serviço' }).click();
              const modalFrame = await page.frameLocator(
                '#divPadrao #frameModal'
              );
              await modalFrame
                .locator('#VL_UNITARIO_IMP')
                .type(value.toString());
              await modalFrame.getByRole('button', { name: 'Salvar' }).click();

              await frame.getByRole('button', { name: 'Voltar' }).click();
              await frame.getByRole('button', { name: 'Voltar' }).click();
              await frame.getByRole('button', { name: 'Voltar' }).click();
            } else {
              console.log(
                `No matching code found for description: ${description.trim()}`
              );
            }
            foundAny = true;
            break;
          }
        }
        console.log(`Account number ${accountNumber} not found.`);
      }
      return foundAny;
    }
  } catch (error) {
    foundAny = false;
    return;
  }
}

function extractAccountNumbers(message) {
  const regex = /Conta:\s(\d+)/g;
  const matches = [];
  let match;

  while ((match = regex.exec(message)) !== null) {
    matches.push(match[1].trim());
  }
  return matches;
}

(async () => {
  const { page, browser } = await loginAndNavigate();
  const frame = await getMainFrame(page);
  page.once('dialog', (dialog) => {
    const dialogMessage = dialog.message();
    accountNumbers = extractAccountNumbers(dialogMessage);
    dialog.dismiss().catch(() => {});
  });

  do {
    await manageBatch(page, frame);
  } while (!foundAny);

  await browser.close();
})();

6782134

FAT UNIMED JUL/AGO
688 GUIAS
R$ 12,044.53

387702 - 1.143,78 - 28
387700 - 1.679,27 - 90
387697 - 1.415,05 - 90
387687 - 1.561,80 - 90
387682 - 1.106,15 - 90
387655 - 1.217,90 - 90
387647 - 1.698,16 - 90
387645 - 1.620,60 - 90
387633 - 601,82   - 30