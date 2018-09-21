# Simple Pipes

## Overview
Provides a http/2 based service for the buffered transfer of arbitrary messages in an distributed environment. This should work as the backbone of an message event driven distributed system. It is in the same time an essential part of a data logistic system.

The individual parts of the infrastructure are intended to be so small, that a design isn't needed at all. Everything should be managed on the architecture level.

### Note
Resource management is needed for unit and integration tests mainly. Because otherwise the limited database resources are
blocking unit tests.

## Seting up of the development environment
Before starting with the development, you have to setup the development environment. To make sure, that every developer can carry his personal settings for the services, it is possible to setup the envrionment with user specific settings.

The user specific settings are stored in the `./usr` subfolder. They will be copied by the command `npm run setup-dev` to the resprective configuration folders. The mechanism uses the $USER variable of the operating system. A workstation specific setting isn't foreseen yet.

## Technology Sketch
The basic idea is, that the service is separated into minimum two independend parts. One is a single threaded server, the `receiver`, that waits for connections, stores the received metadata and content into a local pouchdb. The other is the `forwarder` service, which periodically looks into the pouchDB and forwards the stored content accoring to the given metadata. To support a pull architecture there is a 
`getter` who actively polls the communication partners for informations which are stored in the database where a `provider` can be asked for.

Another worker can be an executor, which interpred the content, if the destination node equals the current node.

## Data Model in an NoSQL database
The following metadata is expected with each data package:
```JSON
{
    "originator": "fqdn.node.name",
    "destination": "fqdn.node.name",
    "content-type": "mime-type",
    "topic": "topic-name",
    "data": BLOB
}
```

# Receiver 
## Node Configuration
Each receiver node can be configured to accept communication only from a particular set of hosts. It is the responsibility
of the receiver to receive metadata and data from a communication partner by http(s) protocol and to persist the data into
a store, which is shared with different workers.

The following metadata is expected to be provided in the configuration:
```JSON
{
    "name": "fqdn.node.name",
    "port": 3000,
    "key-location": "/path/to/https/key",
    "cert-location": "/path/to/https/certificate",
    "acceptedPartners": ["fqdn.node.name", "fqdn.node.name"],
    "accepted-topics": [
        {"name": "topic-name", "hosts": ["fqdn", "fqdn", "fqdn"]}, 
        {"name": "topic-name", "hosts": ["fqdn", "fqdn"]}
    ],
    "database-url": "database url",
    "maxDocumentSizeBytes": 2000000
}
```
An incomplete configuration will result in a termination of the services.

## Functional Description
The `receiver` will accept the connection from a list of hosts. It must validate that the host is in the list of supported communication partners. Only if this is the case, the content of the meta data will be validated. After the successful validation, the data, including the blob, will be stored into the configured database.

# Worker
## General
A worker is configured to read metadata and data from a data store, process the data and mark the data as processed after 
it finished. To avoid parallel processing of the same data, it must be made sure, that the data is not happening.

# Forwarder
## Node Configuration
Each forwarder can be configured to communicate the received information to a set of receiving hosts. Each message will be communicated to all hosts.
A forwarder will read the information of a topic from the database and forward this to the configured hosts.

```JSON
{
    "topic": "The name of the topic",
    "hosts": [{"host": "fqdn", "port": 3000}, {"host": "fqdn", "port": 2000}]
}
```

# Executor
## Node Configuration
This may allow in the future to configure how to work with the different mime-types.

# Exporter
## Overview
This exports all messages, received for the configured topic and targeted to the receiving system, to export them
in the same order, like they were provided on the sender site. Another service, may be used to check, if the message is already exported, or if there is a gap in the sequence of the sequence number of a particular sender.

# Environment
## Cryptography
As the system is using http/2 you have to setup a key and a certificate for it. You may use the following commands to achieve this:
```
openssl genrsa -des3 -passout pass:x -out server.pass.key 2048
openssl rsa -passin pass:x -in server.pass.key -out server.key
rm server.pass.key
openssl req -new -key server.key -out server.csr
openssl x509 -req -sha256 -days 365 -in server.csr -signkey server.key -out server.crt
```
For development purposes, you may choose `localhost` as the FQDN of the host. 

# Janitor
## Overview
The Janitor will cleanup the different topics after the defined retention period. The Janitor is just a special worker with delete rights on the database. This is the only way in the system, that something got deleted!

## Node Configuration
```JSON
{
    "intervalMs": 60000,
    "topics": ["topic-name", "topic-name", "topic-name"],
    "database": "/db"
}
```

# Functional Description
Checks after a configurable interval, if data in the database is stored longer than the retention period for this topic.If the retention period is met, the content will be removed from the database.

# A Simple http/2 client
For the sake of integration tests, a simple http/2 client is provided in the scripts subfolder. This client should be used to replay wrong behaviour between the different nodes of the infrastructure, as it can simulate more use cases than just the limited range given by the protocol between the nodes. It may also be used to simulate security attacs.

# Open Points
* Work on more than one request at a time.
* Cryptography for the docker parts, based on `lets encrypt`.
* Docker Images for the infrastructure parts.
* Architecture Sketch.