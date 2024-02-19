const { log } = require('console');
const puppeteer = require('puppeteer');
const fs = require('fs').promises;

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
    // await dialog.accept();
  });

  try {
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
        // await page.waitForNavigation();


        const elementsInFrame = await page.$$('iframe');
        for (const element of elementsInFrame) {
          console.log('Element:', await element.contentFrame());
        }
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // await browser.close();

    console.log('Execution time:', new Date() - startTime, 'ms');
  }
})();

// filtroAutorizacoes
// NAVIGATE TO PAGE
// await iframe.waitForNavigation();
// await iframe.goto(
//   'https://portal.unimedpalmas.coop.br/pls_montarPastaConsultaAut.action'
// );
// pls_montarPastaConsultaAut.action
// https://portal.unimedpalmas.coop.br/pls_montarFiltrosConsultaAutorizacao.action?dtInicio=13/12/2023&dtFim=11/02/2024&habilitaLocalizador=true&ieTipoProcesso=&ieTipoGuia=&cdGuia=&ieTipoConsulta=&cdBeneficiario=&cdMedico=&cdPrestador=&cdSenha=&ieStatus=&cdGuiaManual=&cdGuiaPrestador=
// https://portal.unimedpalmas.coop.br/pls_montarFiltrosConsultaAutorizacao.action?dtInicio=13/12/2023&dtFim=11/02/2024&habilitaLocalizador=true&ieTipoProcesso=&ieTipoGuia=&cdGuia=&ieTipoConsulta=&cdBeneficiario=&cdMedico=&cdPrestador=&cdSenha=&ieStatus=&cdGuiaManual=&cdGuiaPrestador=
// https://portal.unimedpalmas.coop.br/wheb_legenda.jsp
//         https://portal.unimedpalmas.coop.br/dwr/interface/pls_menu.js
//         https://portal.unimedpalmas.coop.br/bibliotecas/js/plsConsultaPadrao.js?null
//         https://portal.unimedpalmas.coop.br/dwr/interface/pls_arquivoEncode.js

// var nmColunas = ["CD_GUIA", "DT_SOLICITACAO", "NM_SEGURADO", "DS_TIPO_GUIA", "NM_MEDICO_SOLIC", "DS_PLANO", "DS_STATUS_GUIA", "DS_ESTAGIO_GUIA", "DS_TIPO_PROCESSO", "NM_USUARIO", "NR_SEQUENCIA", "CD_GUIA_MANUAL", "CD_GUIA_PRESTADOR", "IE_TIPO_GUIA", "NR_SEQ_SEGURADO", "NR_SEQ_PLANO", "NR_SEQ_PRESTADOR", "CD_CNES", "CD_MEDICO_SOLICITANTE", "NR_CRM", "DS_CONSELHO_PROFISSIONAL", "UF_CRM", "CD_SENHA", "DS_SITUACAO", "DT_VALIDADE_CARTAO", "IE_CARATER_INTERNACAO", "IE_SITUACAO", "DT_AUTORIZACAO", "NR_SEQ_CLINICA", "NR_SEQ_CLINICA_IMP", "DT_EMISSAO", "IE_REGIME_INTERNACAO", "NR_SEQ_TIPO_ACOMODACAO", "DT_ADMISSAO_HOSP", "DS_INDICACAO_CLINICA", "NR_SEQ_AUTORIZACAO_IMP", "IE_TIPO_PROCESSO", "DT_CANCELAMENTO", "IE_FORMA_IMP", "NR_SEQ_GUIA_PRINCIPAL", "NM_RESPONSAVEL_AUTORIZ_IMP", "CD_CPF_PRESTADOR_IMP", "CD_CBO_SAUDE_IMP", "CD_GUIA_PRINCIPAL", "CD_GUIA_PRINCIPAL_IMP", "CD_CGC_SOLICITADO_IMP", "NR_CPF_SOLICITADO_IMP", "CD_INTERNO_SOLICITADO_IMP", "DS_OBSERVACAO_IMP", "NR_SEQ_TIPO_LIMITACAO", "NM_SOLICITADO_IMP", "IE_TIPO_ATEND_TISS", "CD_USUARIO_PLANO_EDIT", "NR_SEQ_PERICIA", "IE_UTILIZADO", "NR_SEQ_REGRA_LIBERACAO", "IE_COBRANCA_PREVISTA", "IE_TIPO_SEGURADO", "NR_SEQ_MOTIVO_CANCEL", "DS_LOG", "IE_ESTAGIO", "DS_OBSERVACAO", "NR_SEQ_MOTIVO_LIB", "NR_SEQ_ATEND_PLS", "NR_SEQ_EVENTO_ATEND", "NR_SEQ_GUIA_PLANO_ANT", "IE_TIPO_CONSULTA", "CD_SENHA_EXTERNA", "CD_VERSAO", "DS_APLICATIVO", "DS_FABRICANTE", "NM_USUARIO_ATENDIMENTO", "DS_BIOMETRIA", "IE_CONSULTA_URGENCIA", "NR_SEQ_UNI_EXEC", "IE_TIPO_INTERCAMBIO", "VL_AUTORIZACAO", "IE_ESTAGIO_COMPLEMENTO", "IE_TIPO_SAIDA", "NR_SEQ_PRESTADOR_WEB", "CD_GUIA_MANUAL_IMP", "NR_SEQ_PGTO_AUT", "IE_PAGAMENTO_AUTOMATICO", "DT_VALID_SENHA_EXT", "NR_SEQ_CONSELHO", "IE_TIPO_GAT", "NR_SEQ_REGRA_COMPL", "CD_ESPECIALIDADE", "IE_RECEM_NASCIDO", "NM_RECEM_NASCIDO", "DT_NASC_RECEM_NASCIDO", "IE_ORIGEM_SOLIC", "NM_USUARIO_SOLIC", "DT_DUPLICACAO_GUIA", "CD_MATRICULA_ESTIPULANTE", "CD_GUIA_PESQUISA", "NR_SEQ_GUIA_ORIGEM", "NR_SEQ_CAT", "NR_SEQ_MOTIVO_PRORROGACAO", "IE_PCMSO", "NR_SEQ_PREST_SOLIC", "IE_RECEM_NASCIDO_IMP", "NM_SOLICITANTE_IMP", "DT_INTERNACAO_IMP", "IE_INDICACAO_QUIMIO_IMP", "IE_INDICACAO_OPME_IMP", "CD_TIPO_ACOMODACAO", "CD_SENHA_REGRA", "NR_SEQ_LOTE_ANEXO_GUIA", "IE_ANEXO_GUIA", "IE_ANEXO_OPME", "IE_ANEXO_QUIMIOTERAPIA", "DT_RECEBIMENTO_XML", "IE_ANEXO_RADIOTERAPIA", "DT_INTERNACAO_SUGERIDA", "IE_AGUARDA_ANEXO_GUIA", "IE_MOTIVO_ENCERRAMENTO", "NR_SEQ_CBO_SAUDE", "NR_SEQ_GUIA_OK", "DT_VALIDADE_SENHA", "QT_DIA_AUTORIZADO", "QT_DIA_SOLICITADO", "IE_STATUS", "DT_ATUALIZACAO", "DT_ATUALIZACAO_NREC", "NM_USUARIO_NREC", "CD_ESTABELECIMENTO", "CD_CNES_IMP", "CD_GUIA_IMP", "NM_MEDICO_SOLICITANTE_IMP", "CD_USUARIO_PLANO_IMP", "DS_PLANO_IMP", "DT_VALIDADE_CARTAO_IMP", "IE_CARATER_INTERNACAO_IMP", "IE_REGIME_INTERNACAO_IMP", "NM_SEGURADO_IMP", "NR_CRM_IMP", "UF_CRM_IMP", "DS_CONSELHO_PROFISSIONAL_IMP", "DT_SOLICITACAO_IMP", "DS_INDICACAO_CLINICA_IMP", "QT_DIA_AUTORIZADO_IMP", "CD_SENHA_IMP", "DT_ADMISSAO_HOSP_IMP", "DT_VALIDADE_SENHA_IMP", "CD_TIPO_ACOMOD_AUTOR_IMP", "CD_ANS_IMP", "NM_PRESTADOR_IMP", "NR_SEQ_PRESTADOR_IMP", "NR_CARTAO_NAC_SUS_IMP", "CD_CGC_SOLICITANTE_IMP", "CD_CPF_SOLICITANTE_IMP", "CD_INTERNO_SOLICITANTE_IMP", "CD_CNES_MEDICO_IMP", "CD_CGC_PRESTADOR_IMP", "NR_CPF_PRESTADOR_IMP", "DT_LIBERACAO", "NM_USUARIO_LIBERACAO", "DT_EMISSAO_IMP", "DS_TOKEN", "ID_APP_EXTERNO", "IE_APP_EXTERNO", "CD_AUSENCIA_VAL_BENEF_TISS", "CD_IDENT_BIOMETRIA_BENEF", "CD_VALIDACAO_BENEF_TISS", "CD_TEMPLATE_BIOMET_BENEF", "IE_TIPO_IDENT_BENEF", "IE_ETAPA_AUTORIZACAO", "DS_QRCODE", "IE_ORIGEM_EXECUCAO", "IE_TIPO_VALIDACAO_BIOMETRIA", "IE_COBERTURA_ESPECIAL", "IE_REGIME_ATENDIMENTO", "IE_SAUDE_OCUPACIONAL", "IE_TIPO_ATEND_ODONTO", "IE_TIPO_FATURAMENTO", "IE_ERRO_CONV_PCT_CIRURGICO"];


// var objTasyGrid = new WhebGrid();
// objTasyGrid.setNmVar("objTasyGrid");
// objTasyGrid.setQtdLinhas(30);
// objTasyGrid.setQtdColunas(13);
// objTasyGrid.setCelulaTexto(myData);
// objTasyGrid.setCabecalhoTexto(dsCabecalho);
// objTasyGrid.setCabecalhoNomes(nmColunasAtributo);
// objTasyGrid.setCompAtribGrid(compAtribGrid);
// objTasyGrid.setTooltipAtribGrid(tooltipAtribGrid);
// objTasyGrid.setCamposObrigatorios(obrigatorios);
// objTasyGrid.setOnClickLinha("executaLinks(objTasyGrid.getIndexLinhasSelec()); setCabOk(); try{ parent.frames['menu'].selecionaMenuLinhaGrid(objTasyGrid.getIndexLinhasSelec());}catch(error){}");
// objTasyGrid.setOnKeyPressLinha("montaBotoes(1, true);");
// objTasyGrid.setOnEnterLinha("onEnterGrid();");
// objTasyGrid.setOnDblClickLinha("onDblClickGrid();");

// https://portal.unimedpalmas.coop.br/pls_montarConsultaAut.action?dtInicio=13/12/2023&dtFim=11/02/2024&ieTipoProcesso=&ieTipoGuia=&ieTipoConsulta=&cdGuia=&cdBeneficiario=&cdMedico=&cdPrestador=&cdSenha=&ieStatus=&cdGuiaManual=&clickPaginacao=S&nrRegistroInicio=0
