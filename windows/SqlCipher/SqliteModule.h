#pragma once

#include "pch.h"

#include "NativeModules.h"

#include <iostream>

namespace SqlCipher {

	REACT_STRUCT(OpenOptions);
	struct OpenOptions {
		REACT_FIELD(name);
		std::string name;

		REACT_FIELD(key);
		std::string key;
	};

	REACT_STRUCT(CloseOptions);
	struct CloseOptions {
		REACT_FIELD(path);
		std::string path; // really this is the name. Legacy oddities
	};

	REACT_STRUCT(DatabaseDetails);
	struct DatabaseDetails {
		REACT_FIELD(dbname);
		std::string dbname;
	};

	REACT_STRUCT(ExecuteStatements);
	struct ExecuteStatements {

	};

	REACT_STRUCT(BackgroundExecute);
	struct BackgroundExecute {
		REACT_FIELD(dbargs);
		DatabaseDetails dbargs;

		REACT_FIELD(executes);
		ExecuteStatements executes;
	};


	REACT_MODULE(SQLite);
	struct SQLite {

		REACT_METHOD(open);
		void open(OpenOptions o) noexcept {
			std::cout << o.name << o.key << std::endl;
			

		}

		REACT_METHOD(close);
		void close(CloseOptions o) noexcept {
			std::cout << o.path << std::endl;

		}

		REACT_METHOD(backgroundExecuteSqlBatch);
		void backgroundExecuteSqlBatch(BackgroundExecute details) noexcept {
			std::cout << details.dbargs.dbname << std::endl;
		}
		
	};
}