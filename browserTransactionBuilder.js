node = "https://node-1.siricoin.tech:5006/"

function convertFromHex(hex) {
    var hex = hex.toString();//force conversion
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}

function convertToHex(str) {
    var hex = '';
    for(var i=0;i<str.length;i++) {
        hex += ''+str.charCodeAt(i).toString(16);
    }
    return hex;
}

async function getAccountInfo(account) {
return (await (await fetch(`${node}/accounts/accountInfo/${account}`)).json()).result;
}

async function getCurrentEpoch() {
	return (await (await fetch(`${node}/chain/getlastblock`)).json()).result.miningData.proof;
}
	

async function getHeadTx(account) {
	let accountInfo = (await getAccountInfo(account));
	return accountInfo.transactions[accountInfo.transactions.length-1];
}

async function buildTransaction(web3Instance, to, tokens) {
	account = (await web3Instance.eth.getAccounts())[0];
	parent = (await getHeadTx(account));
	data = {"from":account, "to":web3Instance.utils.toChecksumAddress(to), "tokens":tokens, "parent": parent, "epoch": (await getCurrentEpoch()),"type": 0};
	strdata = JSON.stringify(data);
	hash = web3Instance.utils.soliditySha3(strdata);
	signature = await web3Instance.eth.personal.sign(strdata, account);
	tx = {"data": data, "sig": signature, "hash": hash, "nodeSigs": {}};
	toSend = convertToHex(JSON.stringify(tx));
	return toSend;
}

async function sendTransaction(signedTx) {
	return (await (await fetch(`${node}/send/rawtransaction/?tx=${signedTx}`)).json()).result;	
}
