# Simple Pipes

## Overview
Provides a http/2 based service for the buffered transfer of arbitrary messages in an distributed environment. This should work as the backbone of an message event driven distributed system. It is in the same time an essential part of a data logistic system, which has to provide different types of data to distinct end points.

The individual parts of the infrastructure are intended to be so small, that a design isn't needed at all. Everything should be managed on the architecture level.

### Note
> Testing of different test suites with jest are running in parallel. This results regulary in race conditions on shared ressources. Because of this, the database location and file ressources should be unique in each test suite.

### Note
> Targets are substituting message destinations. The consumtion of a message is not limited to one destination in this way!

## Seting up of the development environment
The whole settings can be influenced by environment variables only. This allows to influence the settings also at runtime. Take a look to the files in the configuration directory to identify the different environment variables.

## Technology Sketch
The basic idea is, that the service is separated into minimum two independend parts. One is a single threaded server, the `receiver`, that waits for connections, stores the received metadata and content into a local pouchdb. The other is the `forwarder` service, which periodically looks into the pouchDB and forwards the stored content accoring to the given metadata. To support a pull architecture there is a 
`getter` who actively polls the communication partners for informations which are stored in the database where a `provider` can be asked for.

Another worker can be an executor, which interpred the content, if the destination node equals the current node.

For the sake of simplicity, a forwarder may receive messages from an arbitrary number of sources, but forward it to exactly one receiver. For all other setups a "Tee" will be provided, which allows to distribute the messages, received for a certain topic to a collection of hosts. 

## Data Model in an NoSQL database
The following metadata is expected with each data package:
```JSON
{
    "originator": "spipe-URI",
    "content-type": "mime-type",
    "topic": "topic-name",
    "data": BLOB
}
```

A spipe-URI looks like this: `spipe://<node-id>/<service-name>`. It is the responsibility of the worker, working on a node to determine, if he consider himself as a destination. Please note, that the `<node-id>` must *not* be a hostname.

Please consider also, that there is no such thing as the concept of a destination of a message in this system. This is on purpose! The configuration of the complete system determines where the messages will be forwarded to and processed on the way or at the end.

# Message Sender
## Responsibility
A sender is the adapter of an application, which has to send messages to other part of the system. It hides the complexity of the protocol and provides a unique sequence number for every message, send from this 'originator'. Each sender will authenticate himself
as a valid communication partner.

This implies also, that there are probably more than one originator on each host. This leads to the fact, that the originator cannot be just a FQDN. As a originator may be also a destination, a URI is the correct definition of a originator.

## Functional Description
The MessageSender class provides a send() method, which takes the message, the originator id (string) and the topic (string) and the destination (URI) as arguments. It returns almost immediately a promise, which resolves, if the messsage was successful stored in the message queue store. In the background a worker is reading this informatoin from the message queue and forward the message to the configured host. This host don't has to be the final destination, as a forwarder, running on this host might forward the message until
the host is reached.

It should be in the responsibilty of the global configuration, that each message is able to reach finally the destination.

## Node Configuration
```JSON
{
    "originator": "spipe-URI",     // The name of the current node
    "topic": "The name of the topic",
    "host": {"host": "fqdn", "port": 3000},
    "database-url": "http://couch-db-or-file-location",
    "limit": 100,           // 100 messages at a time
    "interval": 3000        // Check every 3s for new messages.
}
```

## Open Points
[ ] Define the resiliant behaviour.

# Receiver 
## Responsibility
A Receiver stores the messages unter a particular topic into the data store. It validates the content of the envelope and checks the maximum size, before it is stored.

## Description
The receiver acts as a http/2 server. It accepts POST requests and stores the provided messages into a database. Each message must come with a topic and is stored in a database, named after this topic. While no sequence is considered during this step, the message id must be unique, as this is used as the "primary-key" while storing the information. A message, provided a second time, or with an message-id which is already in the database, will fail to be stored and is discarded with an error message.

## Node Configuration
Each receiver node can be configured to accept communication from a particular set of hosts only. Given that these notes have to authenticate, a first line of defense against denial of service attacs is in place by this. It is the responsibility of the receiver to receive metadata and data from a communication partner by http(s) protocol and to persist the data into a store, which is shared with different workers.

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
The `receiver` will accept the connection from a list of hosts. It must validate that the host is in the list of supported communication partners. Only if this is the case, the content of the meta data will be validated. After the successful validation, the data, including the message, will be stored into the configured database.

To make sure, that the sequence can be easilly followed, the following pattern for the _id is used: `${data.topic}-${data.originator}-${data["sequence-no"]}`

# Worker
## General Description
A worker is configured to read metadata and data from a data store, process the data and mark the data as processed after it finished. A major invariant of the system, is that the order of the messages is never violated. Given this, the following cases must be considered in every worker implementation:

1. Different routes of the messages, may result in a non sequential receiving of the messages.
2. Different size of the messages may result in the availability of a smaller, later message, before a larger earlier message is availabel.

The handling of these cases may be consolidated in a common worker class. Each worker must also check, if the received message is addressed to him and only process messages, which are. From this addressing, it is only possible to drop the node count, if provided.

## Forwarder
### Responsibility
The forwarder forwards messages in the database to exactly one receiving host. As a selector, it is possible to define the topic, of the message, which should be forwarded. After the message was forwarded, it is moved to the forwarded store, if it is configured. A janitor node should be configured to cleanup this database.

### Functional Description
The forwarder will check if messages of the configured topic are still in the database. If this is the case, he will try to forward them in a chunk to the configured host. If the sending is successful, the message fill be moved to the forwarded database. A janitor should be configured to delete the messages after a retention period.

### Node Configuration
Each forwarder can be configured to communicate the messages to exactly one receiving hosts. If the receiver isn't answering within a configured amount of time, a circuit breaker will step in and will handle the retries.

```JSON
{
    "name": "uri",          // The name of the current node
    "topic": "The name of the topic",
    "host": {"host": "fqdn", "port": 3000},
    "database-url": "http://couch-db-or-file-location",
    "chunk-size": 100,      // 100 messages at a time
    "interval": 3000        // Check every 3s for new messages.
}
```

### Open Topics
[ ] Manage what happen, if the receiving host is not accepting for a configured amount of time/tries.

## Message Executor
### Responsibility
The executor executes messages of a configured topic.

### Functional Description

### Initialization

### Implementation

## Exporter
### Responsibility
This exports all messages, received for the configured topic and targeted to the receiving system, to export them in the same order, like they were provided on the sender site. The exporter is responsible to export the messages in the correct order. No gaps between the different message sequence number of a particular origin is allowed. To make this sure, an exporter should/can be started for each origin.

### Functional Description
The exporter tries to read the next message from the configured database. If there is no message for the configured topics or there is a gap in the sequence number from the originator, the exporter will retry only after the configured amount of time. If it was possible to retrieve the next message, the exporter will try to write the content of the message to the file system. The message file will get the message._id as a name. As the _id is a pre-requisit of the used persistence level, it is save to assume, that the _id field is always present and unique.

If the export was successful, the message with the metadata will be stored into the exported database and only after this step was successful, removed from the topic database.

### Initialization
During the initialization of the exporter he checks, if a bookkeeping record for the configured originator is present. If this is not the case the lowest sequence number will be assumed as 0. Otherwise the sequence number in the bookkeeping record will be used.

### Implementation Remarks
The algorithm uses havily promisses. This allows to run the exporter in a non blocking mode with the highest prossible processing rate of a single threaded system. To ballance and right size the horizontal scaling, a number of performance tests must be planned.

### Open Topics
[ ] Only the content of the message, should be exported. Not the message including the master data!
[ ] Retrieving the initial sequence numer.
[ ] Moving non exported messages to a "error" store.
[ ] Parallel exporting but sequencial remove of the lock file. (Performance)
[ ] Define the resiliant behaviour.

## Janitor
### Overview
The Janitor will cleanup the different topics after the defined retention period. The Janitor is just a special worker with delete rights on the database. This is the only way in the system, that something got deleted! Checks after a configurable interval, if data in the database is stored longer than the retention period for this topic. If the retention period is met, the content will be removed from the database.

- Retention Period must be defined.

### Node Configuration
```JSON
{
    "intervalMs": 60000,
    "topics": ["topic-name", "topic-name", "topic-name"],
    "database": "/db",
    "retention-hours": 24
}
```

### Open Topics
[ ] Start to refine.
[ ] Define the resiliant behaviour.

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

# A Simple http/2 client
For the sake of integration tests, a simple http/2 client is provided in the scripts subfolder. This client should be used to replay wrong behaviour between the different nodes of the infrastructure, as it can simulate more use cases than just the limited range given by the protocol between the nodes. It may also be used to simulate security attacs.

# Open Points
* Cryptography for the docker parts, based on `lets encrypt`.
* Docker Images for the infrastructure parts.
* Architecture Sketches for the different setup scenarios.