const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    await page.goto('https://portal.unimedpalmas.coop.br/');

    // Access the main frame
    const mainFrame = page.mainFrame();

    // Get the child frames
    const childFrames = mainFrame.childFrames();

    // Iterate over each child frame
    for (const frame of childFrames) {
      console.log(`Child frame name: ${frame.name()}`);

      // Access an element in the child frame
      // Check if the child frame is the one we're looking for
      if (frame.name() === 'principal') {
        // Search for the element with the id #item_9
        const element = await frame.$('#item_9');

        if (element) {
          console.log(`Element text: ${await element.evaluate(el => el.textContent)}`);
        } else {
          console.log('Element not found');
        }
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();


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
      // console.log('Iframe name:', iframe.name());
      // const allIds = await iframe.$$eval('[id]', (elements) =>
      //   elements.map((element) => element.id)
      // );
      // console.log('IDs inside the page:', allIds + ' on' + iframe.name());

      if (iframe.name() === 'principal') {
        await iframe.waitForSelector('#tipoUsuario');
        await iframe.select('select#tipoUsuario', 'P');
        await iframe.type('#nmUsuario', 'fisiocep');
        await iframe.type('#dsSenha', 'fisiocep2022');
        await iframe.waitForSelector('#btn_entrar');
        await iframe.$eval('#btn_entrar', (button) => button.click());
        console.log('Credenciais aceitas!');
        const childFrames = iframe.childFrames();
        for (const childFrame of childFrames) {
          console.log(childFrames);

          // Check if the child frame contains the desired element
          const elementHandle = await childFrame.$('#item_9');
          if (elementHandle) {
            const elementText = await elementHandle.evaluate(node => node.textContent);
            console.log('Element text content:', elementText);
          } else {
            console.log('Element not found in this frame.');
          }
        }
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


https://portal.unimedpalmas.coop.br/pls_montarTelaExecucaoRequisicao.action

index_pls.jsp
principal (login.action)
paginaPrincipal (pls_montarTelaExecucaoRequisicao.action)

<body onload="document.getElementById('CD_USUARIO_PLANO').focus();
">
<div>
  <table style="width: 100%;" cellpadding="3">
      <tr>
          
              
              <td class="fonteNegritoPlano" style="text-align: right;"  nowrap>Requisição:</td>
              
              
                  <td>
                      <input type="text" class="numeric" style="width: 128px; text-align: right;" id="NR_SEQ_REQUISICAO" onkeypress="return apenasNumerosCtrlV(event);" value="" onblur="verificaSomenteCaracteresPermitidos(this, '0123456789');"/>
                  </td>
              
          
      </tr>

      <tr>
          <td class="fonteNegritoPlano" style="text-align: right; width: 30%;" nowrap>Beneficiário:</td>                             
          
          
              <td nowrap style="text-align: left; width: 70%;">
                  <div style="float: left;">
                      <input type="text" name="CD_USUARIO_PLANO" class="obrigatorio"  value="" style="width: 130px; text-align: right;" maxlength="" id="CD_USUARIO_PLANO" onchange="if(!document.getElementById('CD_USUARIO_PLANO').readOnly){onBlurBenef()};"  onkeypress="if(!document.getElementById('CD_USUARIO_PLANO').readOnly){if (event.keyCode != 8) {
                                      atualizaCampoTarja(event, 4000)
                                  }};" onclick="if(!document.getElementById('CD_USUARIO_PLANO').readOnly){limparCamposTarja()};"/>
                      
                          <a id="linkLocalizador" href="javascript:;abrirLocalizadorBenef();" tabindex="-1">
                              <img border="0"  src="icones/visualizar.gif">
                          </a>
                      
                  </div>
                  
                  <div style="float: left;">                                 
                      <input readonly="readonly" disabled type="text" value="" name="NM_SEGURADO" id="NM_SEGURADO" 
                             style="width: 353px; margin-top: 5px; margin-left: 3px;"/>
                      <input type="hidden" id="campoTarja" name="campoTarja" value=""  onblur="if(!document.getElementById('CD_USUARIO_PLANO').readOnly){validaBenefLocalizador()};"/>
                      <input type="hidden" name="NR_SEQ_SEGURADO" readonly value="" id="NR_SEQ_SEGURADO" style="width: 15%; text-align: right"  onblur="if(!document.getElementById('CD_USUARIO_PLANO').readOnly){getObterDescSegurado()};"/>
                  </div>
              </td>
                                  
      </tr>
      <tr>
          <td class="fonteNegritoPlano" style="text-align: right;"  nowrap>Cód prestador exec:</td>
          
          
              <td style="text-align: left;" nowrap>
                  <input type="text" class="obrigatorio" name="CD_PRESTADOR_EXEC" maxlength="30"  onblur="obterDescPrestadorExecCodigo();" value=""  style="width: 130px; text-align: right;" id="CD_PRESTADOR_EXEC"/>
                  <a id="linkLocalizador" href="javascript:;montarLocalizadorPrestadorExec();" tabindex="-1">
                      <img border="0"  src="icones/visualizar.gif"/>
                  </a>
                  <input type="text" id="NM_PRESTADOR_EXEC" name="NM_PRESTADOR_EXEC" disabled style="width: 250px;" tabindex="-1"/>
                  <input type="text" name="NR_SEQ_PRESTADOR_EXEC" id="NR_SEQ_PRESTADOR_EXEC"  maxlength="9" onkeypress="return formataNumero(this, event);" onblur="obterDescPrestadorExec(this.value);" value="1394" style="width: 100px; text-align: right;"/>
              </td>
          
      </tr>
   
      <tr>
          <td style="width:5%;">
              
          </td>
          <td style="text-align: left; padding-left: 50px;" nowrap >     
              
              
                  <input type="button"  onclick="montarListaExecucaoRequisicao();" id="btnConsultar"    name="" value="Consultar" onblur="document.getElementById('CD_USUARIO_PLANO').focus();" style="width: 130px; height: 25px;"/>
              
              <!--<input type="button"  onclick="montarListaExecucaoRequisicao()" value="Consultar" tabindex="5" onblur="document.getElementById('CD_USUARIO_PLANO').focus();" style="width: 130px; height: 25px;"/>-->
              <input type="button" value="Gerar guia" style="width: 130px; height: 25px;" onclick="carregarItensSelecionados()" id="btnConfirma" disabled="disabled"/>
              <input type="hidden" name="DS_BIOMETRIA"  id="DS_BIOMETRIA"/>
              <input type="hidden" name="DS_CHAVE_BIOMETRIA" value="X" maxlength="" id="DS_CHAVE_BIOMETRIA"/>
              <input type="hidden" name="IE_TIPO_VALIDACAO_DIGITAL" value="" maxlength="" id="IE_TIPO_VALIDACAO_DIGITAL"/>
              <input type="hidden" name="IE_PAGINA" value="" maxlength="" id="IE_PAGINA"/>                       
              <input type="hidden" name="DS_CONTEUDO_TARJA" id="DS_CONTEUDO_TARJA" value=""/>
          </td>
      </tr>
  </table>
  

  
</div>
</body>