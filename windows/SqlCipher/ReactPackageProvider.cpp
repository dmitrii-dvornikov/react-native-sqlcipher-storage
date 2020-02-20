#include "pch.h"
#include "ReactPackageProvider.h"
#include "ReactPackageProvider.g.cpp"

// NOTE: You must include the headers of your native modules here in
// order for the AddAttributedModules call below to find them.
#include "SqliteModule.h"

using namespace winrt::Microsoft::ReactNative;

namespace winrt::SqlCipher::implementation
{
    void ReactPackageProvider::CreatePackage(IReactPackageBuilder const& packageBuilder) noexcept
    {
        AddAttributedModules(packageBuilder);
    }
}