const BUCKET_NAME= '*';
const PATH="images/";
const AWS = require('aws-sdk');

const s3 = new AWS.S3();


exports.handler = async (event) => {
    
    const operacion = event.queryStringParameters ? event.queryStringParameters.operation : null;

    switch (operacion) {
      case 'actualizar':
        return await actualizarArhivo(event);
      case 'subir':
        return await subriArchivo(event);
      case 'borrar':  
        return await borrarArhivo(event);
      case 'ping':
        return enviarResJSON(200, {"message":`pong`});

      default:
        return enviarResJSON(401, {"message":`Operación no reconocida "${operacion}"`});
    }

};

const borrarArhivo = async (event) => {
  const nombreFichero = event.queryStringParameters ? event.queryStringParameters.nombre : null;
  
  if(nombreFichero==null){
      return enviarResJSON(401, {"message":`El parámetro nombre tiene valor= "${nombreFichero}"`});
  }else{
    // borrar el archivo de S3
    await borrarArhivoS3(PATH + nombreFichero);
    
    //responder correctamente
    return enviarResJSON(200, {"message":`El archivo : "${nombreFichero}" fue borrado satisfactoriamente`});
  }
};

const actualizarArhivo = async (event) => {
  const nombreFichero = event.queryStringParameters ? event.queryStringParameters.nombre : null;
  
  if(nombreFichero==null){
      return enviarResJSON(401, {"message":`El parámetro nombre tiene valor= "${nombreFichero}"`});
  }else{
    
    try { 
      // Extraer el contenido del archivo
      let contenidoFichero = event.isBase64Encoded ? Buffer.from(event.body, 'base64') : event.body;      
      
      //subir el archivo a S3
      await subirArhivoS3(PATH + nombreFichero, contenidoFichero);  
      
      // responder nombre del archivo
      return enviarResJSON(200,{"message":"Archivo subido satisfactoriamente", 'fileName':nombreFichero});
      
    } catch (e) {
      console.log(`Error:${e}`);
      //responder el error en caso de existir
      return enviarResJSON(500,{"message":"Error al intentar subir el archivo", 'error':e});
    }    
      
  }
};

const subriArchivo = async (event) => {
    
    try { 
      // Extraer el contenido del archivo
      let contenidoFichero = event.isBase64Encoded ? Buffer.from(event.body, 'base64') : event.body;      
      
      // Generar nombre del archivo (único)
      let nombreFichero = `${Date.now()}`;
      // Determinar la extensión
      let tipoContenido = event.headers['content-type'] || event.headers['Content-Type'];
      let partes = tipoContenido.split("/");
      let extension=partes[1];
  
      //Generar el nombre final
      let nombreFinalFichero = extension ? `${nombreFichero}.${extension}` : nombreFichero;
    
      //subir el archivo a S3
      await subirArhivoS3(PATH + nombreFinalFichero, contenidoFichero);  
      
      // responder nombre del archivo
      return enviarResJSON(200,{"message":"Archivo subido satisfactoriamente", 'fileName':nombreFinalFichero});
      
    } catch (e) {
      console.log(`Error:${e}`);
      //responder el error en caso de existir
      return enviarResJSON(500,{"message":"Error al intentar subir el archivo", 'error':e});
    }    
  
};

const borrarArhivoS3 = async(key) =>{
  let params = {
    Bucket: BUCKET_NAME, 
    Delete: { // required
      Objects: [ // required
        {
          Key: key // required
        }
      ],
    },
  };  
  return await s3.deleteObjects(params).promise();
};

const subirArhivoS3 = async (keyIn, buffer) => {
  let parametros = {
    Bucket: BUCKET_NAME,
    Key: keyIn,
    Body: buffer
  };
  return await s3.putObject(parametros).promise();
};

const enviarResJSON = (estatus, cuerpo) => {
  var respuesta = {
    statusCode: estatus,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(cuerpo)
  }; 
  return respuesta;
};