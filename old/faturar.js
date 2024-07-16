const puppeteer = require('puppeteer');
const fs = require('fs').promises;

function formatDateTime(dateTime) {
  return dateTime.toLocaleString('pt-BR');
}

function extractNrSeqProtocolo(url) {
  const match = url.match(/nrSeqProtocolo=(\d+)/);
  return match ? match[1] : null;
}
function elapsedTime(startTime) {
  const timeInSeconds = (new Date() - startTime) / 1000;
  if (timeInSeconds < 60) {
    return timeInSeconds + ' segundo' + (timeInSeconds !== 1 ? 's' : '');
  } else {
    const minutes = Math.floor(timeInSeconds / 60);
    const remainingSeconds = Math.floor(timeInSeconds % 60);

    if (remainingSeconds === 0) {
      return minutes + ' minuto' + (minutes !== 1 ? 's' : '');
    } else {
      return (
        minutes +
        ' minuto' +
        (minutes !== 1 ? 's' : '') +
        ' e ' +
        remainingSeconds +
        ' segundo' +
        (remainingSeconds !== 1 ? 's' : '')
      );
    }
  }
}

async function logToFile(
  index,
  codigoGuia,
  numeroCarteirinha,
  nomePaciente,
  dataExec,
  crmMedico,
  nomeMedico
) {
  const timestamp = formatDateTime(new Date());
  const logMessage = `${timestamp} - Numero: ${
    index + 1
  }, Faturando GUIA: ${codigoGuia}, Cartão: ${numeroCarteirinha}, Beneficiário: ${nomePaciente}, Data execução: ${dataExec}, Médico: CRM ${crmMedico} - ${nomeMedico}\n`;

  // Log to console
  console.log(logMessage);
  try {
    await fs.appendFile('log faturamento.txt', logMessage);
  } catch (error) {
    console.error('Error writing to log file:', error);
  }
}

(async () => {
  console.clear();
  const startTime = new Date();
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  const page = await browser.newPage();

  page.on('dialog', async (dialog) => {
    const logMessage = `Dialog message: ${dialog.message()}\n`;
    await fs.appendFile('log faturamento.txt', logMessage);
    console.log(logMessage);
    // await dialog.dismiss();
    await dialog.accept();
  });

  try {
    const fileContent = await fs.readFile('faturar.csv', 'utf-8');
    const lines = fileContent.trim().split('\n');

    await page.goto('https://portal.unimedpalmas.coop.br/');
    const iframes = page.frames();
    for (const iframe of iframes) {
      if (iframe.name() === 'principal') {
        // LOGIN PROCESS
        await iframe.waitForSelector('#tipoUsuario');
        await iframe.select('select#tipoUsuario', 'P');
        await iframe.type('#nmUsuario', 'fisiocep');
        await iframe.type('#dsSenha', 'fisiocep2022');
        await iframe.waitForSelector('#btn_entrar');
        await iframe.$eval('#btn_entrar', (button) => button.click());
        console.log('LOGIN SUCCESSFUL!');
        // NAVIGATE TO PAGE
        await iframe.waitForNavigation();
        await iframe.goto(
          'https://portal.unimedpalmas.coop.br/pls_montarListaProtocolosDigitacao.action'
        );

        // // CLICK ON ANCHOR ELEMENT AND GET PROTOCOL NUMBER
        const firstAnchorElement = await iframe.$('a');
        const hrefContent = await iframe.evaluate(
          (anchor) => anchor.getAttribute('href'),
          firstAnchorElement
        );
        const nrSeqProtocoloValue = extractNrSeqProtocolo(hrefContent);
        await firstAnchorElement.evaluate((a) => a.click());

        for (const [index, line] of lines.entries()) {
          const [
            codigoGuia,
            numeroCarteirinha,
            dataExec,
            nomePaciente,
            crmMedico,
            nomeMedico,
            codUnimedMedico,
          ] = line.trim().split(';');
          const startTimeLoop = new Date();

          // CLICK TO EVALUATE
          // await iframe.waitForNavigation();
          await iframe.goto(
            `https://portal.unimedpalmas.coop.br/pls_montarTelaDigitacaoContasMedicas.action?nrSeqProtocolo=${nrSeqProtocoloValue}&ieTipoGuia=4`
          );

          // TYPE IN CLIENT DATA AND SEARCH
          if (await iframe.waitForSelector('#nr_crm_solicitante')) {
            await iframe.type('#nr_crm_solicitante', crmMedico);
            await page.keyboard.press('Tab');

            if (await iframe.waitForSelector('#nm_medico_solicitante')) {
              const medicoExists = await iframe.$eval(
                '#nm_medico_solicitante',
                (el) => el.value
              );

              if (!medicoExists) {
                console.log(
                  'Médico não identificado automaticamente, injetando credenciais...'
                );
                await iframe.select(
                  'select#idListaMedico_solicitante',
                  codUnimedMedico
                );
                await page.keyboard.press('Tab');
              }
            }
            await page.waitForTimeout(500);
          }

          await iframe.type('#CD_PRESTADOR_EXEC', '30001343');
          await page.keyboard.press('Tab');

          await iframe.select('select#id_grau_participacao_filtro', '10');

          await iframe.type('#nr_crm_participante', '152447');
          await page.keyboard.press('Tab');

          await iframe.select('select#idListaMedico_participante', '225793');
          await page.keyboard.press('Tab');

          // ACCESS NEW FRAME CONTAINING BUTTON
          const iframes = page.frames();
          for (const iframe of iframes) {
            if (iframe.name() === 'frame_2') {
              await iframe.waitForSelector('#btnNovaConta');
              await iframe.$eval('#btnNovaConta', (button) => button.click());
              await page.waitForTimeout(500);

              // FILL IN FORMAT WITH CLIENT DATA
              await iframe.waitForSelector('#cd_guia');
              await iframe.type('#cd_guia', codigoGuia);
              await page.keyboard.press('Tab');
              await page.waitForTimeout(500);

              await iframe.waitForSelector('#CD_USUARIO_PLANO');
              await iframe.type('#CD_USUARIO_PLANO', numeroCarteirinha);
              await page.keyboard.press('Tab');

              await iframe.waitForSelector('#IE_CARATER_INTERNACAO');
              await iframe.select('select#IE_CARATER_INTERNACAO', 'E');

              await iframe.waitForSelector('#NR_SEQ_TIPO_ATENDIMENTO');
              await iframe.select('select#NR_SEQ_TIPO_ATENDIMENTO', '3');

              await iframe.waitForSelector('#IE_INDICACAO_ACIDENTE');
              await iframe.select('select#IE_INDICACAO_ACIDENTE', '9');

              await iframe.waitForSelector('#IE_REGIME_ATENDIMENTO');
              await iframe.select('select#IE_REGIME_ATENDIMENTO', '01');

              await iframe.waitForSelector('#btnSalvar');
              await iframe.$eval('#btnSalvar', (button) => button.click());
              await page.waitForTimeout(500);

              await iframe.waitForSelector('#btnVoltar');
              await iframe.$eval('#btnVoltar', (button) => button.click());
              await page.waitForTimeout(1000);

              // Print the time spent running the application
              await logToFile(
                index,
                codigoGuia,
                numeroCarteirinha,
                nomePaciente,
                dataExec,
                crmMedico,
                nomeMedico
              );

              if (index === lines.length - 1) {
                const completionMessage = `==> ${
                  index + 1
                } Faturmentos concluídos em ${elapsedTime(startTime)}\n`;
                console.log(completionMessage);
                await fs.appendFile('log faturamento.txt', completionMessage);
              }
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();
