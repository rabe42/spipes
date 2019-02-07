const process = require("process")

let databaseUrl = process.env.DB || "ms-db"
module.exports = {
    "originator": `spipe://${process.env.HOSTNAME || "localhost"}/1`,
    "topic": process.env.TOPIC || "config",
    "host": {
        "host": "fqdn", 
        "port": 3000, 
        "certificate": "-----BEGIN CERTIFICATE-----\
        MIIDvDCCAqQCCQCJ/i5cVvPUzzANBgkqhkiG9w0BAQsFADCBnzELMAkGA1UEBhMC\
        REUxDzANBgNVBAgMBkJlcmxpbjEPMA0GA1UEBwwGQmVybGluMRQwEgYDVQQKDAtH\
        SyBTb2Z0d2FyZTEcMBoGA1UECwwTUHJvZHVjdCBEZXZlbG9wbWVudDESMBAGA1UE\
        AwwJbG9jYWxob3N0MSYwJAYJKoZIhvcNAQkBFhdyYmVyZ2VyQGdrLXNvZnR3YXJl\
        LmNvbTAeFw0xODA3MDMxNDQ4MzlaFw0xOTA3MDMxNDQ4MzlaMIGfMQswCQYDVQQG\
        EwJERTEPMA0GA1UECAwGQmVybGluMQ8wDQYDVQQHDAZCZXJsaW4xFDASBgNVBAoM\
        C0dLIFNvZnR3YXJlMRwwGgYDVQQLDBNQcm9kdWN0IERldmVsb3BtZW50MRIwEAYD\
        VQQDDAlsb2NhbGhvc3QxJjAkBgkqhkiG9w0BCQEWF3JiZXJnZXJAZ2stc29mdHdh\
        cmUuY29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA4km+l+s9NTxL\
        YYnmtzW7kYHepfG3scSBt2kLhQBEIHTg2lgRkPKwX0S0JOa7czDnuX7e+NS5dvek\
        zloDUNsZv4wY/dlF9H7xXTSFJaya6XFphKo67ae3iJvyXIZ/CXU7Dl7c2vytPZyi\
        joq2RAmMYjqmxpkKZI9Xf2GOdAuxD7uy01CzWaSnJ6IZ8NYgA7flyvKydMJkvyc0\
        hR+3ZAstmamdmwvi9EhE3sXGALLM6lxYQL9WWI9qagmq6hYNPDgYD50S2Ke7A0n0\
        ZWGdNAr8rIgMHgsq1zhBfSVQSrtNmyjMJDu4tHw75C19/lpZ9vMk9bhnWIQ5gOz+\
        X50sBqeCsQIDAQABMA0GCSqGSIb3DQEBCwUAA4IBAQBAfGBrfOSs9+ZGIdbwZ2tv\
        ekewK1jA4Obat8gam0gPVhTQOwMzLZEemdw9h6oGUiAvEQjEz5rKC/ApyeaDkObD\
        8pTKyZC1Xm/4jZxwaMrXS2G9fufthFSbTd5mVGVDjSsvt3nNlsUJhjcaJKGDg3po\
        oUGZGTIgmLUe0P3oaB9QjvRQBpxFs6WkQLGX5gYSKIDTSHztsKdLxaAqkVCeAkSY\
        UebRc/CWSVJ8HHpoC4KSKhZBFrzwK/QuYOc3/Gt5dbmxukvBrXWpVVWtfCu5Plap\
        P75G2+RRVC4PKaqEv1kX8x1C4tjBHkb8aO3/fcdUXjk8caycMKpXOBag+9ZsGemj\
        -----END CERTIFICATE-----"},
    "database-url": databaseUrl,
    "bookkeeping-url": process.env.DB_BOOK || databaseUrl + "/bookkeeping",
    "limit": process.env.LIMIT || 10,
    "interval": process.env.INTERVAL || 500,
}