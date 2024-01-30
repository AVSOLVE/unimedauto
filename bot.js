const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });
  const page = await browser.newPage();

  try {
    await page.goto('https://portal.unimedpalmas.coop.br/');

    const iframes = await page.frames();
    for (const iframe of iframes) {
      console.log('Iframe name:', iframe.name());
      const allIds = await iframe.$$eval('[id]', (elements) =>
        elements.map((element) => element.id)
      );
      console.log('IDs inside the page:', allIds + ' on' + iframe.name());

      if (iframe.name() === 'principal') {
        await iframe.waitForSelector('#tipoUsuario');
        await iframe.select('select#tipoUsuario', 'P');
        console.log('Usuário selecionado!');
        await iframe.type('#nmUsuario', 'fisiocep');
        await iframe.type('#dsSenha', 'fisiocep2022');
        await iframe.waitForSelector('#btn_entrar');
        console.log('Credenciais preenchidas!');
        await iframe.$eval('#btn_entrar', (button) => button.click());
        await iframe.waitForSelector('#item_9');

        // const childFrames = iframe.childFrames();
        // // Output the URLs of child frames
        // console.log(`URLs of child frames in ${iframe.url()}:`);
        // for (const childFrame of childFrames) {
        //   console.log(childFrame.url());
        // }
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the browser
    // await browser.close();
  }
})();
