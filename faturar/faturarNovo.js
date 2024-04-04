const fs = require('fs').promises;
const logColors = require('ansi-colors');
const { chromium } = require('playwright');
const { login, password } = { login: 'fisiocep', password: 'fisiocep2022' };

function formatElapsedTime(elapsedTime) {
  const totalSeconds = Math.floor(elapsedTime / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
    2,
    '0'
  )}:${String(seconds).padStart(2, '0')}`;
}
async function loginAuth(page) {
  const timeout = 5000;
  page.setDefaultTimeout(timeout);
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('https://portal.unimedpalmas.coop.br/', {
    waitUntil: 'networkidle',
  });

  await page
    .frameLocator('iframe >> nth=0')
    .frameLocator('#principal')
    .locator('#tipoUsuario')
    .selectOption('P');
  await page
    .frameLocator('iframe >> nth=0')
    .frameLocator('#principal')
    .locator('#nmUsuario')
    .click();
  await page
    .frameLocator('iframe >> nth=0')
    .frameLocator('#principal')
    .locator('#nmUsuario')
    .fill(login);
  await page
    .frameLocator('iframe >> nth=0')
    .frameLocator('#principal')
    .locator('#dsSenha')
    .click();
  await page
    .frameLocator('iframe >> nth=0')
    .frameLocator('#principal')
    .locator('#dsSenha')
    .fill(password);
  await page
    .frameLocator('iframe >> nth=0')
    .frameLocator('#principal')
    .getByRole('button', { name: 'Entrar' })
    .click();
  await page
    .frameLocator('iframe >> nth=0')
    .frameLocator('#principal')
    .frameLocator('td iframe')
    .frameLocator('frame >> nth=0')
    .getByText('Digitação de contas médicas')
    .click();
  await page
    .frameLocator('iframe >> nth=0')
    .frameLocator('#principal')
    .frameLocator('td iframe')
    .frameLocator('frame >> nth=0')
    .getByText('» Digitar conta médica')
    .click();
  await page
    .frameLocator('iframe >> nth=0')
    .frameLocator('#principal')
    .frameLocator('td iframe')
    .frameLocator('#paginaPrincipal')
    .getByRole('link', { name: 'Utilizar' })
    .click();

  console.log('Logged in and routed in!');

  return page;
}

async function monkeyBusiness(page) {
  await page
    .frameLocator('iframe >> nth=0')
    .frameLocator('#principal')
    .frameLocator('td iframe')
    .frameLocator('#paginaPrincipal')
    .locator('#CD_PRESTADOR_EXEC')
    .dblclick();
  await page
    .frameLocator('iframe >> nth=0')
    .frameLocator('#principal')
    .frameLocator('td iframe')
    .frameLocator('#paginaPrincipal')
    .locator('#CD_PRESTADOR_EXEC')
    .fill('330001343');
  await page
    .frameLocator('iframe >> nth=0')
    .frameLocator('#principal')
    .frameLocator('td iframe')
    .frameLocator('#paginaPrincipal')
    .locator('#CD_PRESTADOR_EXEC')
    .click();
  await page
    .frameLocator('iframe >> nth=0')
    .frameLocator('#principal')
    .frameLocator('td iframe')
    .frameLocator('#paginaPrincipal')
    .locator('#CD_PRESTADOR_EXEC')
    .click();
  await page
    .frameLocator('iframe >> nth=0')
    .frameLocator('#principal')
    .frameLocator('td iframe')
    .frameLocator('#paginaPrincipal')
    .locator('#CD_PRESTADOR_EXEC')
    .fill('30001343');
  await page
    .frameLocator('iframe >> nth=0')
    .frameLocator('#principal')
    .frameLocator('td iframe')
    .frameLocator('#paginaPrincipal')
    .locator('#CD_PRESTADOR_EXEC')
    .press('Tab');
  await page
    .frameLocator('iframe >> nth=0')
    .frameLocator('#principal')
    .frameLocator('td iframe')
    .frameLocator('#paginaPrincipal')
    .locator('#NR_SEQ_PRESTADOR_EXEC')
    .press('Tab');
  await page
    .frameLocator('iframe >> nth=0')
    .frameLocator('#principal')
    .frameLocator('td iframe')
    .frameLocator('#paginaPrincipal')
    .locator('#id_grau_participacao_filtro')
    .selectOption('10');
  await page
    .frameLocator('iframe >> nth=0')
    .frameLocator('#principal')
    .frameLocator('td iframe')
    .frameLocator('#paginaPrincipal')
    .locator('#id_grau_participacao_filtro')
    .press('Tab');
  await page
    .frameLocator('iframe >> nth=0')
    .frameLocator('#principal')
    .frameLocator('td iframe')
    .frameLocator('#paginaPrincipal')
    .locator('#nr_crm_participante')
    .fill('152447');
  await page
    .frameLocator('iframe >> nth=0')
    .frameLocator('#principal')
    .frameLocator('td iframe')
    .frameLocator('#paginaPrincipal')
    .locator('#nr_crm_participante')
    .press('Tab');
  await page
    .frameLocator('iframe >> nth=0')
    .frameLocator('#principal')
    .frameLocator('td iframe')
    .frameLocator('#paginaPrincipal')
    .locator('#idListaMedico_participante')
    .selectOption('225793');
  await page
    .frameLocator('iframe >> nth=0')
    .frameLocator('#principal')
    .frameLocator('td iframe')
    .frameLocator('#paginaPrincipal')
    .locator('#idListaMedico_participante')
    .press('Tab');
}

async function processCSV(page) {
  const startTime = new Date();
  const fileContent = await fs.readFile('faturar.csv', 'utf-8');
  const lines = fileContent.trim().split('\n');
  const loopTimes = [];

  for (const [index, line] of lines.entries()) {
    const loopStartTime = new Date();

    const [
      codigoGuia,
      numeroCarteirinha,
      dataExec,
      nomePaciente,
      codUnimedMedico,
      nomeMedico,
      crmMedico,
    ] = line.trim().split(';');

    await page
      .frameLocator('iframe >> nth=0')
      .frameLocator('#principal')
      .frameLocator('td iframe')
      .frameLocator('#paginaPrincipal')
      .getByRole('button', { name: 'Novo' })
      .click();

    console.log(
      logColors.bgWhiteBright(
        `Faturando => ${nomePaciente} com guia de ${dataExec}!`
      )
    );

    await page
      .frameLocator('iframe >> nth=0')
      .frameLocator('#principal')
      .frameLocator('td iframe')
      .frameLocator('#paginaPrincipal')
      .locator('#nr_crm_solicitante')
      .fill(crmMedico);

    await page
      .frameLocator('iframe >> nth=0')
      .frameLocator('#principal')
      .frameLocator('td iframe')
      .frameLocator('#paginaPrincipal')
      .locator('#nr_crm_solicitante')
      .press('Tab');

    //  SE NÃO ACHAR O MÉDICO VIA CRM, DEVE TESTAR O CÓD UNIMED
    try {
      const listaMedicoSolicitante = await page
        .frameLocator('iframe >> nth=0')
        .frameLocator('#principal')
        .frameLocator('td iframe')
        .frameLocator('#paginaPrincipal')
        .locator('#idListaMedico_solicitante');
      if (listaMedicoSolicitante) {
        await listaMedicoSolicitante.selectOption(codUnimedMedico);
        console.log(
          logColors.bgYellowBright(
            `Credenciais para o Dr. ${nomeMedico} injetadas!`
          )
        );
      }
    } catch (error) {
      console.log(
        logColors.bgGreenBright(
          `Dr. ${nomeMedico} identificado automaticamente!`
        )
      );
    }

    await monkeyBusiness(page);

    await page
      .frameLocator('iframe >> nth=0')
      .frameLocator('#principal')
      .frameLocator('td iframe')
      .frameLocator('#paginaPrincipal')
      .frameLocator('iframe[name="frame_2"]')
      .getByRole('button', { name: 'Novo' })
      .click();

    await page
      .frameLocator('iframe >> nth=0')
      .frameLocator('#principal')
      .frameLocator('td iframe')
      .frameLocator('#paginaPrincipal')
      .frameLocator('iframe[name="frame_2"]')
      .locator('#CD_GUIA_PRESTADOR')
      .fill(codigoGuia);

    await page
      .frameLocator('iframe >> nth=0')
      .frameLocator('#principal')
      .frameLocator('td iframe')
      .frameLocator('#paginaPrincipal')
      .frameLocator('iframe[name="frame_2"]')
      .locator('#CD_GUIA_PRESTADOR')
      .press('Tab');

    await page
      .frameLocator('iframe >> nth=0')
      .frameLocator('#principal')
      .frameLocator('td iframe')
      .frameLocator('#paginaPrincipal')
      .frameLocator('iframe[name="frame_2"]')
      .locator('#CD_USUARIO_PLANO')
      .fill(numeroCarteirinha);

    await page
      .frameLocator('iframe >> nth=0')
      .frameLocator('#principal')
      .frameLocator('td iframe')
      .frameLocator('#paginaPrincipal')
      .frameLocator('iframe[name="frame_2"]')
      .locator('#CD_USUARIO_PLANO')
      .press('Tab');

    await page
      .frameLocator('iframe >> nth=0')
      .frameLocator('#principal')
      .frameLocator('td iframe')
      .frameLocator('#paginaPrincipal')
      .frameLocator('iframe[name="frame_2"]')
      .locator('#nr_crm_solicitante')
      .fill(crmMedico);

    await page
      .frameLocator('iframe >> nth=0')
      .frameLocator('#principal')
      .frameLocator('td iframe')
      .frameLocator('#paginaPrincipal')
      .frameLocator('iframe[name="frame_2"]')
      .locator('#nr_crm_solicitante')
      .press('Tab');

    //  PREENCHER CBO VIA CRM => SE NÃO ACHAR O MÉDICO VIA CRM, DEVE TESTAR O CÓD UNIMED
    try {
      const listaMedicoSolicitante = await page
        .frameLocator('iframe >> nth=0')
        .frameLocator('#principal')
        .frameLocator('td iframe')
        .frameLocator('#paginaPrincipal')
        .frameLocator('iframe[name="frame_2"]')
        .locator('#idListaMedico_solicitante');
      if (listaMedicoSolicitante) {
        await listaMedicoSolicitante.selectOption(codUnimedMedico);
        await listaMedicoSolicitante.press('Tab');
        console.log(logColors.bgYellowBright(`CBO injetada!`));
      }
    } catch (error) {
      console.log(logColors.bgGreenBright(`CBO identificado automaticamente!`));
    }

    await page
      .frameLocator('iframe >> nth=0')
      .frameLocator('#principal')
      .frameLocator('td iframe')
      .frameLocator('#paginaPrincipal')
      .frameLocator('iframe[name="frame_2"]')
      .locator('#IE_CARATER_INTERNACAO')
      .selectOption('E');

    await page
      .frameLocator('iframe >> nth=0')
      .frameLocator('#principal')
      .frameLocator('td iframe')
      .frameLocator('#paginaPrincipal')
      .frameLocator('iframe[name="frame_2"]')
      .locator('#NR_SEQ_TIPO_ATENDIMENTO')
      .selectOption('3');

    await page
      .frameLocator('iframe >> nth=0')
      .frameLocator('#principal')
      .frameLocator('td iframe')
      .frameLocator('#paginaPrincipal')
      .frameLocator('iframe[name="frame_2"]')
      .locator('#IE_INDICACAO_ACIDENTE')
      .selectOption('9');

    await page
      .frameLocator('iframe >> nth=0')
      .frameLocator('#principal')
      .frameLocator('td iframe')
      .frameLocator('#paginaPrincipal')
      .frameLocator('iframe[name="frame_2"]')
      .locator('#IE_REGIME_ATENDIMENTO')
      .selectOption('01');

    await page
      .frameLocator('iframe >> nth=0')
      .frameLocator('#principal')
      .frameLocator('td iframe')
      .frameLocator('#paginaPrincipal')
      .frameLocator('iframe[name="frame_2"]')
      .getByRole('button', { name: 'Salvar conta' })
      .click();

    await page
      .frameLocator('iframe >> nth=0')
      .frameLocator('#principal')
      .frameLocator('td iframe')
      .frameLocator('#paginaPrincipal')
      .frameLocator('iframe[name="frame_2"]')
      .getByRole('button', { name: 'Consistir' })
      .click();

    const codigoGlosa = 1;
    try {
      const codigoGlosaLocator = await page
        .frameLocator('iframe >> nth=0')
        .frameLocator('#principal')
        .frameLocator('td iframe')
        .frameLocator('#paginaPrincipal')
        .frameLocator('iframe[name="frame_2"]')
        .locator('tr.registroLista > td:nth-child(2)')
        .textContent();

      codigoGlosa = await codigoGlosaLocator.trim();
    } catch (error) {
      console.log(logColors.bgRed(`Não foi possível excluir a conta!`));
    }

    if (codigoGlosa === 'CM552') {
      console.log(logColors.bgRed('GLOSA: CM552 - essa guia já foi faturada!'));
      await page
        .frameLocator('iframe >> nth=0')
        .frameLocator('#principal')
        .frameLocator('td iframe')
        .frameLocator('#paginaPrincipal')
        .frameLocator('iframe[name="frame_2"]')
        .getByRole('button', { name: 'Excluir conta' })
        .click();
    } else {
      await page
        .frameLocator('iframe >> nth=0')
        .frameLocator('#principal')
        .frameLocator('td iframe')
        .frameLocator('#paginaPrincipal')
        .frameLocator('iframe[name="frame_2"]')
        .getByRole('button', { name: 'Voltar' })
        .click();
    }

    const loopEndTime = new Date();
    const loopElapsedTime = loopEndTime - loopStartTime;
    loopTimes.push(loopElapsedTime);
    console.log(
      `Time spent on loop ${index + 1}: ${formatElapsedTime(loopElapsedTime)}`
    );
  }

  const endTime = new Date();
  const totalTime = endTime - startTime;
  const totalLoops = lines.length;
  const averageTime =
    loopTimes.reduce((acc, curr) => acc + curr, 0) / totalLoops;

  console.log(`Total time: ${formatElapsedTime(totalTime)}`);
  console.log(`Total loops: ${totalLoops}`);
  console.log(
    logColors.bgYellow(
      `Average time per loop: ${formatElapsedTime(averageTime)}`
    )
  );
}

(async () => {
  console.clear();
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  await loginAuth(page);
  page.on('dialog', async (dialog) => {
    const logMessage = `Dialog message: ${dialog.message()}`;
    // await dialog.dismiss();
    await dialog.accept();
    console.log(logColors.bgBlueBright(logMessage));
  });
  page.on('popup', async (popup) => {
    await popup.waitForLoadState();
    popup.close();
  });
  await processCSV(page);
  browser.close();
})();
