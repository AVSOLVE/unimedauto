const { loginAuth } = require('../shared/loginAuth');
const { logMessage, retry, matchCode } = require('../shared/helper');
const today = new Date().toLocaleDateString('pt-BR');
let accountNumbers = [];

async function loginAndNavigate() {
  const { page, browser } = await loginAuth();
  page.once('dialog', (dialog) => {
    const dialogMessage = dialog.message();
    accountNumbers = extractAccountNumbers(dialogMessage);
    dialog.dismiss().catch(() => {});
  });
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

async function fixCM568(page, frame) {
  try {
    let hasInconsistencies = await frame
      .getByRole('cell', { name: 'Possui inconsistências' })
      .first()
      .isVisible();

    while (hasInconsistencies) {
      await frame
        .locator('tr:has-text("Possui inconsistências") > td:nth-child(9)')
        .first()
        .click();

      await frame.getByRole('button', { name: 'Proc/Mat' }).click();

      while (await isCM568(frame)) {
        console.log('CM568 found.');
        await setNextDate(page, frame);
        await frame.getByRole('button', { name: 'Consistir' }).click();
      }

      await frame.getByRole('button', { value: 'Voltar' }).first().click();
      await frame.locator('#btnVoltar').click();
      
    }
  } catch (error) {
    console.error(`Error in fixCM568: ${error.message}`);
  }
}

async function isCM568(frame) {
  try {
    let description = await frame
      .locator('tr.registroLista')
      .nth(3)
      .locator('td:nth-child(3)')
      .textContent();

    return description?.trim().includes('CM568') ?? false;
  } catch (error) {
    console.error(`Error in isCM568: ${error.message}`);
    return false;
  }
}

async function isPast(frame) {
  try {
    let description = await frame
      .locator('tr.registroLista')
      .nth(2)
      .locator('td:nth-child(5)')
      .textContent();

    const [day, month, year] = description.trim().split('/').map(Number);
    const date = new Date(year, month - 1, day);

    console.log('isPast: ', date < new Date());
    return date < new Date();
  } catch (error) {
    console.error(`Error in isPast: ${error.message}`);
    return false;
  }
}

async function setNextDate(page, frame) {
  try {
    await frame.getByRole('img', { name: 'Alterar serviço' }).click();
    const currentDate = await page
      .frameLocator('#divPadrao #frameModal')
      .locator('#dt_realizacao')
      .inputValue();

    const nextDate = getNextDay(currentDate);

    await page
      .frameLocator('#divPadrao #frameModal')
      .locator('#dt_realizacao')
      .fill(nextDate);
    await page
      .frameLocator('#divPadrao #frameModal')
      .getByRole('button', { name: 'Salvar' })
      .click();

    await frame.getByRole('button', { name: 'Consistir' }).click();
    console.log('Date updated to: ', nextDate);
  } catch (error) {
    console.error(`Error in setNextDate: ${error.message}`);
  }
}

function getNextDay(dateString) {
  try {
    const [day, month, year] = dateString.split('/').map(Number);

    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() + 1);

    const nextDay = date.getDate();
    const nextMonth = date.getMonth() + 1;
    const nextYear = date.getFullYear();

    const formattedDay = nextDay.toString().padStart(2, '0');
    const formattedMonth = nextMonth.toString().padStart(2, '0');

    return `${formattedDay}/${formattedMonth}/${nextYear}`;
  } catch (error) {
    console.error(`Error in getNextDay: ${error.message}`);
    return dateString; // Return the original string in case of an error
  }
}

async function manageBatch(page, frame) {
  try {
    for (const accountNumber of accountNumbers) {
      console.log(`Processing account number: ${accountNumber}`);
      const rows = await frame.locator('tr.registroLista');
      const rowsCount = await rows.count();

      for (let i = 0; i < rowsCount; i++) {
        const text = await rows.nth(i).locator('td').first().textContent();
        if (text.includes(`${accountNumber}`)) {
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

          if (value) {
            await frame.getByRole('img', { name: 'Alterar serviço' }).click();

            await page
              .frameLocator('#divPadrao #frameModal')
              .locator('#VL_UNITARIO_IMP')
              .type(value.toString());

            // await page
            //   .frameLocator('#divPadrao #frameModal')
            //   .locator('#VL_UNITARIO_IMP')
            //   .evaluate((element, value) => {
            //     element.value = value;
            //     element.dispatchEvent(new Event('input', { bubbles: true }));
            //   }, value.toString());

            await page
              .frameLocator('#divPadrao #frameModal')
              .getByRole('button', { name: 'Salvar' })
              .click();

            await frame
              .getByRole('button', { value: 'Voltar' })
              .first()
              .click();
            await frame.locator('#btnVoltar').click();
          } else {
            console.log(
              `No matching code found for description: ${description.trim()}`
            );
          }
          // break;
        }
      }
      console.log(`Account number ${accountNumber} not found.`);
    }
  } catch (error) {
    console.log(error);
    throw error;
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
  console.log(accountNumbers);

  await frame.getByRole('link', { name: 'Utilizar' }).last().click();
  await fixCM568(page, frame);
  // if (accountNumbers.length > 0) {
  // await frame
  // .frameLocator('#paginaPrincipal')
  // .getByRole('link', { name: 'Finalizar protocolo' })
  // .last()
  // .click();
  //   while (accountNumbers.length > 0) {
  //     try {
  //       await manageBatch(page, frame);
  //     } catch (error) {
  //       break;
  //     }
  //   }
  // } else {
  //   await fixCM568(page, frame);
  // }
  // await browser.close();
})();

// 6782134

// FAT UNIMED JUL/AGO
// 688 GUIAS
// R$ 12,044.53

// 387702 - 1.143,78 - 28
// 387700 - 1.679,27 - 90
// 387697 - 1.415,05 - 90
// 387687 - 1.561,80 - 90
// 387682 - 1.106,15 - 90
// 387655 - 1.217,90 - 90
// 387647 - 1.698,16 - 90
// 387645 - 1.620,60 - 90
// 387633 - 601,82   - 30
