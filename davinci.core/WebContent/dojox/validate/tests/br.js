dojo.provide("dojox.validate.tests.br");
dojo.require("dojox.validate.br");


tests.register("dojox.validate.tests.br",[
	//Randomy generated valid CNJP/CGC numbers.
	{
		name:"isValidCnpj",
		runTest: function(doh) { 
			doh.assertTrue(dojox.validate.br.isValidCnpj('75.730.657/0001-03'), "1 Checking ##.###.###/####-## format");
			doh.assertTrue(dojox.validate.br.isValidCnpj('75730657/0001-03'), "1 Checking ########/####-## format");
			doh.assertTrue(dojox.validate.br.isValidCnpj('757306570001-03'), "1 Checking ############-## format");
			doh.assertTrue(dojox.validate.br.isValidCnpj('75730657000103'), "1 Checking ############## format");
			doh.assertTrue(dojox.validate.br.isValidCnpj(75730657000103), "1 Checking numeric ############## format");

			doh.assertTrue(dojox.validate.br.isValidCnpj('05.101.993/0001-01'), "2 Checking ##.###.###/####-## format");
			doh.assertTrue(dojox.validate.br.isValidCnpj('05101993/0001-01'), "2 Checking ########/####-## format");
			doh.assertTrue(dojox.validate.br.isValidCnpj('051019930001-01'), "2 Checking ############-## format");
			doh.assertTrue(dojox.validate.br.isValidCnpj('05101993000101'), "2 Checking ############## format");
			doh.assertTrue(dojox.validate.br.isValidCnpj(5101993000101), "2 Checking numeric ############## format");

			doh.assertTrue(dojox.validate.br.isValidCnpj('79.577.986/0001-17'), "3 Checking ##.###.###/####-## format");
			doh.assertTrue(dojox.validate.br.isValidCnpj('79577986/0001-17'), "3 Checking ########/####-## format");
			doh.assertTrue(dojox.validate.br.isValidCnpj('795779860001-17'), "3 Checking ############-## format");
			doh.assertTrue(dojox.validate.br.isValidCnpj('79577986000117'), "3 Checking ############## format");
			doh.assertTrue(dojox.validate.br.isValidCnpj(79577986000117), "3 Checking numeric ############## format");

			doh.assertFalse(dojox.validate.br.isValidCnpj('79.577.986/0001-18'), "4 Checking ##.###.###/####-## format");
			doh.assertFalse(dojox.validate.br.isValidCnpj('79577986/0001-18'), "4 Checking ########/####-## format");
			doh.assertFalse(dojox.validate.br.isValidCnpj('795779860001-18'), "4 Checking ############-## format");
			doh.assertFalse(dojox.validate.br.isValidCnpj('79577986000118'), "4 Checking ############## format");
			doh.assertFalse(dojox.validate.br.isValidCnpj(79577986000118), "4 Checking numeric ############## format");
			doh.assertFalse(dojox.validate.br.isValidCnpj(0), "5 Checking numeric ############## format");
			doh.assertFalse(dojox.validate.br.isValidCnpj('00000000000000'), "4 Checking numeric ############## format");
			doh.assertFalse(dojox.validate.br.isValidCnpj('11111111111111'), "4 Checking numeric ############## format");
			doh.assertFalse(dojox.validate.br.isValidCnpj('22222222222222'), "4 Checking numeric ############## format");
		}
	},
	{
		name:"computeCnpjDv",
		runTest: function(doh) { 
			doh.assertEqual("03", dojox.validate.br.computeCnpjDv('75.730.657/0001'), "1 Checking ##.###.###/#### format");
			doh.assertEqual("03", dojox.validate.br.computeCnpjDv('75730657/0001'), "1 Checking ########/#### format");
			doh.assertEqual("03", dojox.validate.br.computeCnpjDv('757306570001'), "1 Checking ############ format");
			doh.assertEqual("03", dojox.validate.br.computeCnpjDv(757306570001), "1 Checking numeric ############ format");

			doh.assertEqual("01", dojox.validate.br.computeCnpjDv('05.101.993/0001'), "2 Checking ##.###.###/#### format");
			doh.assertEqual("01", dojox.validate.br.computeCnpjDv('05101993/0001'), "2 Checking ########/#### format");
			doh.assertEqual("01", dojox.validate.br.computeCnpjDv('051019930001'), "2 Checking ############ format");
			doh.assertEqual("01", dojox.validate.br.computeCnpjDv(51019930001), "2 Checking numeric ############ format");

			doh.assertEqual("17", dojox.validate.br.computeCnpjDv('79.577.986/0001'), "3 Checking ##.###.###/#### format");
			doh.assertEqual("17", dojox.validate.br.computeCnpjDv('79577986/0001'), "3 Checking ########/#### format");
			doh.assertEqual("17", dojox.validate.br.computeCnpjDv('795779860001'), "3 Checking ############ format");
			doh.assertEqual("17", dojox.validate.br.computeCnpjDv(795779860001), "3 Checking numeric ############ format");
		}
	},
	//All CPF numbers randomly generated from: http://www.gerardocumentos.com.br
	{
		name:"isValidCpf",
		runTest: function(doh) { 
			doh.assertTrue(dojox.validate.br.isValidCpf('362.866.226-59'), "1 Checking ###.###.###-## format");
			doh.assertTrue(dojox.validate.br.isValidCpf('362866226-59'), "1 Checking #########-## format");
			doh.assertTrue(dojox.validate.br.isValidCpf('36286622659'), "1 Checking ########### format");
			doh.assertTrue(dojox.validate.br.isValidCpf(36286622659), "1 Checking numeric ########### format");

			doh.assertTrue(dojox.validate.br.isValidCpf('781.215.062-39'), "2 Checking ###.###.###-## format");
			doh.assertTrue(dojox.validate.br.isValidCpf('781215062-39'), "2 Checking #########-## format");
			doh.assertTrue(dojox.validate.br.isValidCpf('78121506239'), "2 Checking ########### format");
			doh.assertTrue(dojox.validate.br.isValidCpf(78121506239), "2 Checking numeric ########### format");

			doh.assertTrue(dojox.validate.br.isValidCpf('670.832.400-86'), "3 Checking ###.###.###-## format");
			doh.assertTrue(dojox.validate.br.isValidCpf('670832400-86'), "3 Checking #########-## format");
			doh.assertTrue(dojox.validate.br.isValidCpf('67083240086'), "3 Checking ########### format");
			doh.assertTrue(dojox.validate.br.isValidCpf(67083240086), "3 Checking numeric ########### format");

			doh.assertTrue(dojox.validate.br.isValidCpf('271.034.755-55'), "4 Checking ###.###.###-## format");
			doh.assertTrue(dojox.validate.br.isValidCpf('271034755-55'), "4 Checking #########-## format");
			doh.assertTrue(dojox.validate.br.isValidCpf('27103475555'), "4 Checking ########### format");
			doh.assertTrue(dojox.validate.br.isValidCpf(27103475555), "4 Checking numeric ########### format");
		}
	},
	{
		name:"computeCpfDv",
		runTest: function(doh) { 
			doh.assertEqual("59", dojox.validate.br.computeCpfDv('362.866.226'), "1 Checking ###.###.### format");
			doh.assertEqual("59", dojox.validate.br.computeCpfDv('362866226'), "1 Checking ######### format");
			doh.assertEqual("59", dojox.validate.br.computeCpfDv(362866226), "1 Checking numeric ######### format");

			doh.assertEqual("39", dojox.validate.br.computeCpfDv('781.215.062'), "2 Checking ###.###.### format");
			doh.assertEqual("39", dojox.validate.br.computeCpfDv('781215062'), "2 Checking ######### format");
			doh.assertEqual("39", dojox.validate.br.computeCpfDv(781215062), "2 Checking numeric ######### format");

			doh.assertEqual("86", dojox.validate.br.computeCpfDv('670.832.400'), "3 Checking ###.###.### format");
			doh.assertEqual("86", dojox.validate.br.computeCpfDv('670832400'), "3 Checking ######### format");
			doh.assertEqual("86", dojox.validate.br.computeCpfDv(670832400), "3 Checking numeric ######### format");

			doh.assertEqual("55", dojox.validate.br.computeCpfDv('271.034.755'), "4 Checking ###.###.### format");
			doh.assertEqual("55", dojox.validate.br.computeCpfDv('271034755'), "4 Checking ######### format");
			doh.assertEqual("55", dojox.validate.br.computeCpfDv(271034755), "4 Checking numeric ######### format");

		}
	}
]);
