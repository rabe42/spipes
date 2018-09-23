/* global process */

module.exports = {
    "name": process.env.HOSTNAME || "localhost",
    "topic": process.env.TOPIC || "config",
    "hosts": [
        {"host": "fqdn", "port": 3000, key: "-----BEGIN RSA PRIVATE KEY-----\
        MIIEowIBAAKCAQEA4km+l+s9NTxLYYnmtzW7kYHepfG3scSBt2kLhQBEIHTg2lgR\
        kPKwX0S0JOa7czDnuX7e+NS5dvekzloDUNsZv4wY/dlF9H7xXTSFJaya6XFphKo6\
        7ae3iJvyXIZ/CXU7Dl7c2vytPZyijoq2RAmMYjqmxpkKZI9Xf2GOdAuxD7uy01Cz\
        WaSnJ6IZ8NYgA7flyvKydMJkvyc0hR+3ZAstmamdmwvi9EhE3sXGALLM6lxYQL9W\
        WI9qagmq6hYNPDgYD50S2Ke7A0n0ZWGdNAr8rIgMHgsq1zhBfSVQSrtNmyjMJDu4\
        tHw75C19/lpZ9vMk9bhnWIQ5gOz+X50sBqeCsQIDAQABAoIBAF8mTQsKMimBWd0A\
        pE+jO2R6rEkws2H/U9/wPpTFQOA45RdKctB1C65zcCAYGPfdt4IrE8yjffzFMrpF\
        5SEJj/EYEqYixySAgDMF03q88kJ4mrra7X5iyGybzjQTpbUvYw6u2sUF/D5s73lq\
        YCuJrErdiKT3UwRntY3tUn3/MIuBQXQgWxXeXP9E7czYvidSSiSej+QGSvcMpR1s\
        rqqSH508F4cwrNPoaQksiHZ/Txn5ODF+dccBYfFRaGPoyoDSRQ+JHthmoqOK9Ob+\
        U8pX5+iIXBYYGfz7ILjJomYs26fJ3EXCIyWsUI5L99GK0ly0YoL5tZvaq7Y5E3YF\
        geL9FzECgYEA/064pHpvrcCi5Y5rDM/UjRXd0mzn+6s57GPgR7UBHwGNowjJuFKZ\
        ILQHkUJULiUvsvzELBaZrQ/e1+EYrNkKVY3RSrfwLBu0IxU+hgFBVVrw0lkgdmCZ\
        4OUmyPq9886PUSSD7zcfkH9u6U4AgBUs1DeS5YhgNxMpDA1b44MWJa0CgYEA4ubf\
        d5NXiv79E5yrdn3qJtJgCNEgAo+y8Kf4i3B+Jn5cUCfs1HaDFuLooHWAlAmvF4Ye\
        YVxSr1iOkA/Oiukcx3EU+QsRNsxVJZ5m3KqLuaccRznYoqwsaZGI1XqZiHcg1TKM\
        T7+HeZXFdqjNO1PRrMO35nHRgE6ZmN5a9hJCiZUCgYAWOnplB6v1itIj/nRflzDA\
        X+kCSy0fglb2t/NtCttgIbh9O2SkwbxHVqVaBlZh9ibjBJLn68fRg5I5ZYXKdtMp\
        g8F3KfClRnw2mcDp1e4kSlixV8U1yU9cf1cTJJGpSpC71dwO1dPPtuinM31jqXRP\
        vc7yYR9PbEGkpP0dH+qruQKBgAzoNS4II6K0fpDvCJHk97zdmrjlrHx40CUAaRMF\
        gyeNaJLmsoIje7GBltoJ1RaWtm8QIgpHxixTTUjEnWspd4mg1SCVkJUdanqJWDCV\
        Qv18lA85KymVwbD/plj+cF1i6Ws3ROQEcSBpdKIbWBFX40WAnKVvNAuobPRVMbdt\
        sntBAoGBAIPbq5uu4/OJAL6OasFv+sAklD5gXp70SoPwB07fqSqbStq3bfbqwGKu\
        mogIKWvzjG/ob+R9OnMe6vp7uIPG5AKuwnt1sK9cAMx9vLveiDXvmLWlTHJavBRE\
        OAgfW9ExtS6rQ0vQ7PY0X631QM/op0jqC26poK49JZJFNYFSANfo\
        -----END RSA PRIVATE KEY-----"},
        {"host": "fqdn", "port": 2000, key: "asdf"}
    ],
    "database-url": process.env.DB || "db",
    "limit": process.env.LIMIT || 10,
    "interval": process.env.INTERVAL || 500,
}
