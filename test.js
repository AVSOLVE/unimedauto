const puppeteer = require('puppeteer');
const fs = require('fs').promises;

(async () => {
  console.clear();

  const performActions = async () => {
    // CHECKBOXES
    const checkboxesSelector = 'input[type="checkbox"]';
    await page.waitForSelector(checkboxesSelector);
    const checkboxes = await page.$$(checkboxesSelector);
    for (const checkbox of checkboxes) {
      await checkbox.click();
    }
    await page.waitForTimeout(2000);

    // CLICK TO EVALUATE
    const btnConfirma = await page.$('#btnConfirma');
    await btnConfirma.click();

    // SELECT BOXES SETTING
    const selectEval = 'select';
    await page.waitForSelector(selectEval);
    const selectBoxes = await page.$$(selectEval);
    if (selectBoxes) {
      for (const selectBox of selectBoxes) {
        await selectBox.select('3');
      }
      await page.waitForTimeout(2000);

      // INPUT BOXES SETTING
      const inputTextSelector = 'input[type="text"]';
      await page.waitForSelector(inputTextSelector);
      const inputTexts = await page.$$(inputTextSelector);
      for (const inputText of inputTexts) {
        await inputText.evaluate((input) => (input.value = '1'));
      }
      await page.waitForTimeout(2000);

      // CLICK TO EVALUATE
      const btnConfirmaGuia = await page.$('input[type="button"]');
      await btnConfirmaGuia.click();
      await page.waitForTimeout(2000);

      // CLICK TO LEAVE EVALUATE FEEDBACK
      await page.waitForSelector('input[type="button"]');
      const btnVoltar = await page.$$('input[type="button"]');
      for (const btnBack of btnVoltar) {
        await btnBack.evaluate((button) => button.click());
      }
      await page.waitForTimeout(2000);

      await readCodesFromFileAndPerformActions();
    } 
    else {
      console.warn('No select boxes found');
      return;
    }
  };

  const readCodesFromFileAndPerformActions = async () => {
    try {
      // Read the file containing 17-digit codes, assuming one code per line
      const codes = (await fs.readFile('codes.txt', 'utf-8')).split('\n');

      // Iterate through each code and perform actions
      for (const code of codes) {
        if (code.trim().length === 17) {
          console.log(`Performing actions for code: ${code.trim()}`);

          // NEXT
          await page.waitForSelector('#CD_USUARIO_PLANO');
          await page.type('#CD_USUARIO_PLANO', code.trim());
          await page.keyboard.press('Tab');
          await page.$eval('#btnConsultar', (button) => button.click());

          await performActions();
          await page.waitForTimeout(5000); // Adjust wait time if needed
        } else {
          console.warn(`Invalid code: ${code.trim()}`);
        }
      }
    } catch (error) {
      console.error('Error reading codes from file:', error);
    }
  };

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });
  const page = await browser.newPage();

  try {
    await page.goto('https://portal.unimedpalmas.coop.br/');
    const iframes = await page.frames();
    for (const iframe of iframes) {
      if (iframe.name() === 'principal') {
        // LOGIN PROCESS
        await iframe.waitForSelector('#tipoUsuario');
        await iframe.select('select#tipoUsuario', 'P');
        await iframe.type('#nmUsuario', 'fisiocep');
        await iframe.type('#dsSenha', 'fisiocep2022');
        await iframe.waitForSelector('#btn_entrar');
        await iframe.$eval('#btn_entrar', (button) => button.click());

        // NAVIGATE TO PAGE
        await iframe.waitForNavigation();
        await iframe.goto(
          'https://portal.unimedpalmas.coop.br/pls_montarTelaExecucaoRequisicao.action'
        );

        // TYPE IN CLIENT DATA AND SEARCH
        await iframe.waitForSelector('#CD_USUARIO_PLANO');
        await iframe.type('#CD_USUARIO_PLANO', '00060503633005014');
        await page.keyboard.press('Tab');
        await iframe.$eval('#btnConsultar', (button) => button.click());

        await performActions();
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // await browser.close();
  }
})();
