const fs = require('fs').promises;
const { loginAuth } = require('../shared/loginAuth');
const {
  formatElapsedTime,
  logMessage,
  getElapsedTime,
  retry,
} = require('../shared/helper');

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
    await frame
      .frameLocator('#paginaPrincipal')
      .getByRole('link', { name: 'Utilizar' })
      .first()
      .click();
  };
  try {
    await retry(execute);
    console.clear();
    logMessage('green', 'REDIRECIONANDO! AGUARDE...');
    return { page, browser };
  } catch (error) {
    logMessage('yellow', `O REDIRECIONAMENTO FALHOU! ERRO: ${error.message}!`);
    throw error;
  }
}

async function getFrame(page) {
  return page
    .frameLocator('iframe >> nth=0')
    .frameLocator('#principal')
    .frameLocator('td iframe')
    .frameLocator('#paginaPrincipal');
}

async function handleNovoFaturamento(frame, nomePaciente, dataExec) {
  const execute = async () => {
    await frame.getByRole('button', { name: 'Novo' }).click();
  };

  try {
    await retry(execute);
    logMessage('white', `FATURANDO: ${nomePaciente}, DATA GUIA: ${dataExec}!`);
  } catch (error) {
    logMessage('red', 'Falha ao processar novo faturamento: ' + error.message);
    throw error;
  }
}

async function handleMedicoSolicitante(frame, codUnimedMedico) {
  try {
    const listaMedicoSolicitante = await frame.locator(
      '#idListaMedico_solicitante'
    );
    if (listaMedicoSolicitante) {
      await listaMedicoSolicitante.selectOption(codUnimedMedico);
      await listaMedicoSolicitante.press('Tab');
      logMessage('magenta', `CBO injetada!`);
    }
  } catch (error) {
    logMessage('blue', `CBO detectada!`);
  }
}

async function handleMedicoParticipante(frame) {
  const execute = async () => {
    await frame.locator('#id_grau_participacao_filtro').selectOption('10');
    await frame.locator('#id_grau_participacao_filtro').press('Tab');
    await frame.locator('#nr_crm_participante').fill('152447');
    await frame.locator('#nr_crm_participante').press('Tab');
    await frame.locator('#idListaMedico_participante').selectOption('225793');
    await frame.locator('#idListaMedico_participante').press('Tab');
  };

  try {
    await retry(execute);
    logMessage('green', 'Médico participante processado com sucesso!');
  } catch (error) {
    logMessage(
      'red',
      'Falha ao processar médico participante: ' + error.message
    );
    throw error;
  }
}

async function handleDadosUsuario(
  frame,
  codigoGuia,
  numeroCarteirinha,
  crmMedico
) {
  const execute = async () => {
    await frame.getByRole('button', { name: 'Novo' }).click();
    await frame.locator('#CD_GUIA_REFERENCIA').fill(codigoGuia);
    await frame.locator('#CD_GUIA_REFERENCIA').press('Tab');
    await frame.locator('#cd_guia').fill(codigoGuia);
    await frame.locator('#cd_guia').press('Tab');
    await frame.locator('#CD_USUARIO_PLANO').fill(numeroCarteirinha);
    await frame.locator('#CD_USUARIO_PLANO').press('Tab');
    await frame.locator('#nr_crm_solicitante').fill(crmMedico);
    await frame.locator('#nr_crm_solicitante').press('Tab');
  };

  try {
    await retry(execute);
    logMessage('green', 'Dados do usuário processados com sucesso!');
  } catch (error) {
    logMessage('red', 'Falha ao processar dados do usuário: ' + error.message);
    throw error;
  }
}

async function handleDadosAtendimento(frame) {
  const execute = async () => {
    await frame.locator('#IE_CARATER_INTERNACAO').selectOption('E');
    await frame.locator('#NR_SEQ_TIPO_ATENDIMENTO').selectOption('3');
    await frame.locator('#IE_INDICACAO_ACIDENTE').selectOption('9');
    await frame.locator('#IE_REGIME_ATENDIMENTO').selectOption('01');
    await frame.getByRole('button', { name: 'Salvar conta' }).click();
    await frame.getByRole('button', { name: 'Consistir' }).click();
  };

  try {
    await retry(execute);
    logMessage('green', 'Dados de atendimento processados com sucesso!');
  } catch (error) {
    logMessage(
      'red',
      'Falha ao processar dados de atendimento: ' + error.message
    );
    throw error;
  }
}

async function handleGlosa(frame) {
  let codigoGlosa = null;

  const execute = async () => {
    try {
      const codigoGlosaLocator = await frame
        .locator('tr.registroLista > td:nth-child(2)')
        .textContent();
      codigoGlosa = codigoGlosaLocator.trim();
      logMessage('green', `GLOSA: ${codigoGlosa}`);
    } catch (error) {
      logMessage('green', 'GLOSA: Nenhuma glosa encontrada!');
    }

    if (codigoGlosa === 'CM552') {
      logMessage('red', 'GLOSA: CM552 - essa guia já foi faturada!');
      await frame.getByRole('button', { name: 'Excluir conta' }).click();
    } else {
      await frame.getByRole('button', { name: 'Voltar' }).click();
    }
  };

  try {
    await retry(execute);
  } catch (error) {
    logMessage('red', `Error processing row:`, error);
    throw error;
  }
}

async function fixGlosa(frame) {
  try {
    const condition = await frame
      .getByRole('cell', { name: 'Possui inconsistências' })
      .first();

    if (condition) {
      logMessage('green', `Condition met. Performing actions...`);

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
        logMessage('green', `GLOSA: ${codigoGlosa}`);
      } catch (error) {
        logMessage('green', 'GLOSA: Nenhuma glosa encontrada!', error);
      }

      if (codigoGlosa === 'CM552') {
        logMessage('red', 'GLOSA: CM552 - essa guia já foi faturada!');

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
      logMessage('red', `Condition not met.`);
    }
  } catch (error) {
    logMessage('red', `Error processing row:`, error);
  }
}

async function processCSV(page) {
  const startTime = new Date();
  const fileContent = await fs.readFile('guiasFaturar.csv', 'utf-8');
  const lines = fileContent.trim().split('\n');
  const loopTimes = [];
  const frame = await getFrame(page);

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

    // await fixGlosa(frame);

    await handleNovoFaturamento(frame, nomePaciente, dataExec);

    await frame.locator('#nr_crm_solicitante').fill(crmMedico);
    await frame.locator('#nr_crm_solicitante').press('Tab');

    //  SE NÃO ACHAR O MÉDICO VIA CRM, DEVE TESTAR O CÓD UNIMED
    await handleMedicoSolicitante(frame, codUnimedMedico);
    await handleMedicoParticipante(frame);
    const frame2 = await frame.frameLocator('iframe[name="frame_2"]');
    await handleDadosUsuario(frame2, codigoGuia, numeroCarteirinha, crmMedico);

    //  SE NÃO ACHAR O MÉDICO VIA CRM, DEVE TESTAR O CÓD UNIMED
    await handleMedicoSolicitante(frame2, codUnimedMedico);
    await handleDadosAtendimento(frame2);
    await handleGlosa(frame2);

    const loopEndTime = new Date();
    const loopElapsedTime = loopEndTime - loopStartTime;
    loopTimes.push(loopElapsedTime);
    logMessage(
      'white',
      `Tempo gasto na guia ${index + 1}: ${formatElapsedTime(loopElapsedTime)}`
    );
  }

  const totalLoops = lines.length;
  const averageTime =
    loopTimes.reduce((acc, curr) => acc + curr, 0) / totalLoops;

  logMessage('green', `Tempo total: ${getElapsedTime(startTime)}`);
  logMessage('green', `Total de guias: ${totalLoops}`);
  logMessage(
    'green',
    `Tempo médio por guia: ${formatElapsedTime(averageTime)}`
  );
}

(async () => {
  const { page, browser } = await loginAndNavigate();

  page.on('dialog', async (dialog) => {
    await dialog.accept();
    logMessage('blue', `===> ${dialog.message()}`);
  });

  page.on('popup', async (popup) => {
    await popup.waitForLoadState();
    popup.close();
  });

  await processCSV(page);
  browser.close();
})();
