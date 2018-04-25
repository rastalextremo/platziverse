# platziverse-mqtt

## Instalación

```
  npm install --save-dev standard nodemon
  npm i debug mosca redis chalk
  sudo apt-get install redis-server
  sudo npm install -g mqtt

  Para probar MQTT desde consola: mqtt pub -t 'agent/message' -h localhost -m 'Hello Platziverse'
```
  

## `agent/connected`

``` js
{
  agent: {
    uuid, //autogenerar
    username, //definir por configuracion
    name, //definir por configuracion
    hostname, //obtener del sistema operativo
    pid //obtener del proceso
  }
}
```

## `agent/disconnected`

``` js
{
  agent: {
    uuid //autogenerar
  }
}
```

## `agent/message`

``` js
{
  agent,
  metrics: [
    {
      type,
      value
    }
  ],
  timestamp //generar cuando creamos el mensaje
}
```
