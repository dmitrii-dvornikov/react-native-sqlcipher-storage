using System;
using Microsoft.ReactNative.Managed;
using Newtonsoft.Json;

namespace react_native_sqlcipher_storage
{
    [ReactModule]
    public sealed class SqlCipherModule
    {
        [ReactMethod("open")]
        public void open(JObject config)
        {

        }
    }
}
