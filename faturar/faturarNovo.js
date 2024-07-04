const fs = require('fs').promises;
const logColors = require('ansi-colors');
const { loginAuth } = require('../shared/loginAuth');

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

async function monkeyBusiness(page) {
  const frame = page
    .frameLocator('iframe >> nth=0')
    .frameLocator('#principal')
    .frameLocator('td iframe')
    .frameLocator('#paginaPrincipal');

  await frame.locator('#id_grau_participacao_filtro').selectOption('10');

  await frame.locator('#id_grau_participacao_filtro').press('Tab');

  await frame.locator('#nr_crm_participante').fill('152447');

  await frame.locator('#nr_crm_participante').press('Tab');

  await frame.locator('#idListaMedico_participante').selectOption('225793');

  await frame.locator('#idListaMedico_participante').press('Tab');
}

async function fixGlosa(frame) {
  try {
    const condition = await frame
      .getByRole('cell', { name: 'Possui inconsistências' })
      .first();

    if (condition) {
      console.log(`Condition met. Performing actions...`);

      await frame
        .locator('tr:has-text("Possui inconsistências") > td:nth-child(9)')
        .first()
        .click();

      let codigoGlosa = 1;
      try {
        const codigoGlosaLocator = await frame
          .frameLocator('iframe[name="frame_2"]')
          .getByRole('cell')
          .textContent();

        codigoGlosa = await codigoGlosaLocator.trim();
        console.log(`GLOSA: ${codigoGlosa}`);
      } catch (error) {
        console.log(error);
        console.log(
          logColors.bgGreen('GLOSA: Nenhuma glosa encontrada!', error)
        );
      }

      if (codigoGlosa === 'CM552') {
        console.log(
          logColors.bgRed('GLOSA: CM552 - essa guia já foi faturada!')
        );
        await frame
          .frameLocator('iframe[name="frame_2"]')
          .getByRole('button', { name: 'Excluir conta' })
          .click();
      } else {
        await frame
          .frameLocator('iframe[name="frame_2"]')
          .getByRole('button', { name: 'Voltar' })
          .click();
      }

      await frame.getByRole('button', { name: 'Proc/Mat' }).click();

      await frame.getByRole('img', { name: 'Alterar serviço' }).click();
    } else {
      console.log(`Condition not met.`);
    }
  } catch (error) {
    console.error(`Error processing row:`, error);
  }
}

async function processCSV(page) {
  const startTime = new Date();
  const fileContent = await fs.readFile('faturar.csv', 'utf-8');
  const lines = fileContent.trim().split('\n');
  const loopTimes = [];

  const frame = page
    .frameLocator('iframe >> nth=0')
    .frameLocator('#principal')
    .frameLocator('td iframe')
    .frameLocator('#paginaPrincipal');

  for (const [index, line] of lines.entries()) {
    const loopStartTime = new Date();

    const [
      codigoGuia,
      numeroCarteirinha,
      dataExec,
      nomePaciente,
      crmMedico,
      nomeMedico,
      codUnimedMedico,
    ] = line.trim().split(';');

    await fixGlosa(frame);

    await frame.getByRole('button', { name: 'Novo' }).click();
    console.log(
      logColors.bgWhiteBright(
        `Faturando => ${nomePaciente} com guia de ${dataExec}!`
      )
    );

    await frame.locator('#nr_crm_solicitante').fill(crmMedico);

    await frame.locator('#nr_crm_solicitante').press('Tab');

    //  SE NÃO ACHAR O MÉDICO VIA CRM, DEVE TESTAR O CÓD UNIMED
    try {
      const listaMedicoSolicitante = await frame.locator(
        '#idListaMedico_solicitante'
      );
      if (listaMedicoSolicitante) {
        await listaMedicoSolicitante.selectOption(codUnimedMedico);
        await listaMedicoSolicitante.press('Tab');
        console.log(logColors.bgYellowBright(`CBO injetada!`));
      }
    } catch (error) {
      console.log(logColors.bgGreenBright(`CBO identificado automaticamente!`));
    }

    await monkeyBusiness(page);

    const frame2 = frame.frameLocator('iframe[name="frame_2"]');

    await frame2.getByRole('button', { name: 'Novo' }).click();

    await frame2.locator('#CD_GUIA_REFERENCIA').fill(codigoGuia);

    await frame2.locator('#CD_GUIA_REFERENCIA').press('Tab');

    await frame2.locator('#cd_guia').fill(codigoGuia);

    await frame2.locator('#cd_guia').press('Tab');

    await frame2.locator('#CD_USUARIO_PLANO').fill(numeroCarteirinha);

    await frame2.locator('#CD_USUARIO_PLANO').press('Tab');

    await frame2.locator('#nr_crm_solicitante').fill(crmMedico);

    await frame2.locator('#nr_crm_solicitante').press('Tab');

    //  PREENCHER CBO VIA CRM => SE NÃO ACHAR O MÉDICO VIA CRM, DEVE TESTAR O CÓD UNIMED
    try {
      const listaMedicoSolicitante = await frame2.locator(
        '#idListaMedico_solicitante'
      );
      if (listaMedicoSolicitante) {
        await listaMedicoSolicitante.selectOption(codUnimedMedico);
        await listaMedicoSolicitante.press('Tab');
        console.log(logColors.bgYellowBright(`CBO injetada!`));
      }
    } catch (error) {
      console.log(logColors.bgGreenBright(`CBO identificado automaticamente!`));
    }

    await frame2.locator('#IE_CARATER_INTERNACAO').selectOption('E');

    await frame2.locator('#NR_SEQ_TIPO_ATENDIMENTO').selectOption('3');

    await frame2.locator('#IE_INDICACAO_ACIDENTE').selectOption('9');

    await frame2.locator('#IE_REGIME_ATENDIMENTO').selectOption('01');

    await frame2.getByRole('button', { name: 'Salvar conta' }).click();

    await frame2.getByRole('button', { name: 'Consistir' }).click();

    let codigoGlosa = 1;
    try {
      const codigoGlosaLocator = await frame2
        .locator('tr.registroLista > td:nth-child(2)')
        .textContent();

      codigoGlosa = await codigoGlosaLocator.trim();
    } catch (error) {
      console.log(error);
      console.log(logColors.bgGreen('GLOSA: Nenhuma glosa encontrada!', error));
    }

    if (codigoGlosa === 'CM552') {
      console.log(logColors.bgRed('GLOSA: CM552 - essa guia já foi faturada!'));
      await frame2.getByRole('button', { name: 'Excluir conta' }).click();
    } else {
      await frame2.getByRole('button', { name: 'Voltar' }).click();
    }

    const loopEndTime = new Date();
    const loopElapsedTime = loopEndTime - loopStartTime;
    loopTimes.push(loopElapsedTime);
    console.log(
      `Tempo gasto na guia ${index + 1}: ${formatElapsedTime(loopElapsedTime)}`
    );
  }

  const endTime = new Date();
  const totalTime = endTime - startTime;
  const totalLoops = lines.length;
  const averageTime =
    loopTimes.reduce((acc, curr) => acc + curr, 0) / totalLoops;

  console.log(`Tempo total: ${formatElapsedTime(totalTime)}`);
  console.log(`Total de guias: ${totalLoops}`);
  console.log(
    logColors.bgYellow(
      `Tempo médio por guia: ${formatElapsedTime(averageTime)}`
    )
  );
}

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

(async () => {
  const { page, browser } = await loginAuth();
  await redirectToContasMedicas(page);

  page.on('dialog', async (dialog) => {
    const logMessage = `===> ${dialog.message()}`;
    // await dialog.dismiss();
    await dialog.accept();
    console.log(logColors.bgBlueBright(logMessage));
  });
  page.on('popup', async (popup) => {
    await popup.waitForLoadState();
    popup.close();
  });
  await processCSV(page);
  // browser.close();
})();
