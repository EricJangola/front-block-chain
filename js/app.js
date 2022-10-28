
const tableElem = document.getElementById("table-body");
const tableElemVoter = document.getElementById("table-body-eleitor");
const candidateOptions = document.getElementById("candidate-options");
const voteForm = document.getElementById("vote-form");

var proposals = [];
let voters = [];
var myAddress;
var eleicao;
// const CONTRACT_ADDRESS = "0xf396a27e87ccf377c289b8375c3817046e94133e";
const CONTRACT_ADDRESS = "0xe1275fAc4CfFc9658cB738B4588b8942eD7a8A9e";

const ethEnabled = () => {
	if (window.ethereum) {
		window.web3 = new Web3(window.ethereum);
		window.ethereum.enable();
		return true;
	}
	return false;
}

const getMyAccounts = accounts => {
	try {
		if (accounts.length == 0) {
			alert("Você não tem contas habilitadas no Metamask!");
		} else {
			myAddress = accounts[0];
			accounts.forEach(async myAddress => {
				console.log(myAddress + " : " + await window.web3.eth.getBalance(myAddress));
			});
		}
	} catch (error) {
		console.log("Erro ao obter contas...");
	}
};

window.addEventListener('load', async function () {

	if (!ethEnabled()) {
		alert("Por favor, instale um navegador compatível com Ethereum ou uma extensão como o MetaMask para utilizar esse dApp!");
	}
	else {
		getMyAccounts(await web3.eth.getAccounts());

		eleicao = new web3.eth.Contract(VotingContractInterface, CONTRACT_ADDRESS);
		getCandidatos(eleicao, populaCandidatos);

		const chariperson = chairperson();
		if (!chariperson) {
			$("#add-candidate-form").hide();
			$("#add-voting-person-form").hide();
			$("#finish-form").hide();
			$("#table-content-eleitor").hide();
		}
		const mystatus = getMyStatus();
		$("#voting-status").val(mystatus);
	}
});

function myStatus() {
	//contractRef.methods.getProposalsCount().call().then((count)=>{
	eleicao.methods.getMyStatus().call(async function (error, status) {
		return status;
	});
}

function getCandidatos(contractRef, callback) {
	//contractRef.methods.getProposalsCount().call().then((count)=>{
	contractRef.methods.getProposalsCount().call(async function (error, count) {
		console.log('count', count);
		for (i = 0; i < count; i++) {
			await contractRef.methods.getProposal(i).call().then((data) => {
				console.log('data', data);
				var proposal = {
					name: data[0],
					voteCount: data[1]
				};
				proposals.push(proposal);
			});
		}
		if (callback) {
			callback(proposals);
		}

	});
}

function populaCandidatos(candidatos) {
	candidatos.forEach((candidato, index) => {
		// Creates a row element.
		const rowElem = document.createElement("tr");

		// Creates a cell element for the name.
		const nameCell = document.createElement("td");
		nameCell.innerText = candidato.name;
		rowElem.appendChild(nameCell);

		// Creates a cell element for the votes.
		const voteCell = document.createElement("td");
		voteCell.id = "vote-" + candidato.name;
		voteCell.innerText = candidato.voteCount;
		rowElem.appendChild(voteCell);

		// Adds the new row to the voting table.
		tableElem.appendChild(rowElem);

		// Creates an option for each candidate
		const candidateOption = document.createElement("option");
		candidateOption.value = index;
		candidateOption.innerText = candidato.name;
		candidateOptions.appendChild(candidateOption);
	});
}


$("#btnVote").on('click', function () {
	candidato = $("#candidate-options").children("option:selected").val();

	eleicao.methods.vote(candidato).send({ from: myAddress })
		.on('receipt', function (receipt) {
			//getCandidatos(eleicao, populaCandidatos);
			windows.location.reaload(true);
		})
		.on('error', function (error) {
			console.log(error.message);
			return;
		});

});

$("#btnAddCandidate").on('click', function () {
	const candidato = $("#candidate-name").val();

	eleicao.methods.addProposalToList([candidato]).send({ from: myAddress })
		.on('receipt', function (receipt) {
			//getCandidatos(eleicao, populaCandidatos);
			windows.location.reaload(true);
		})
		.on('error', function (error) {
			console.log(error.message);
			return;
		});
});


$("#btnAddVotingPerson").on('click', function () {
	const address = $("#voting-person").val();
	const contractName = $("#voting-person-name").val();

	eleicao.methods.giveRightToVote(address, contractName).send({ from: myAddress })
		.on('receipt', function (receipt) {
			//getCandidatos(eleicao, populaCandidatos);
			windows.location.reaload(true);
		})
		.on('error', function (error) {
			console.log(error.message);
			return;
		});
});

$("#btnFinish").on('click', function () {
	eleicao.methods.finishVoting().send({ from: myAddress })
		.on('receipt', function (receipt) {

			$("#table-body").show();
			//getCandidatos(eleicao, populaCandidatos);
			windows.location.reaload(true);
		})
		.on('error', function (error) {
			console.log(error.message);
			return;
		});
});

$("#btnDelegate").on('click', function () {

	const address = $("#delegate-input").val();

	eleicao.methods.delegate(address).send({ from: myAddress })
		.on('receipt', function (receipt) {
			//getCandidatos(eleicao, populaCandidatos);
			windows.location.reaload(true);
		})
		.on('error', function (error) {
			console.log(error.message);
			return;
		});
});

// function chairperson() {

// 	eleicao.methods.chairperson().call({ from: myAddress })
// 		.on('receipt', function (error, data) {
// 			//getCandidatos(eleicao, populaCandidatos);
// 			return data;
// 		})
// 		.on('error', function (error) {
// 			console.log(error.message);
// 			return;
// 		});
// }


async function chairperson() {
	return await eleicao.methods.chairperson().call({ from: myAddress });
}


function populaVoters(voters) {
	voters.forEach((voter, index) => {
		// Creates a row element.
		const rowElem = document.createElement("tr");

		// Creates a cell element for the name.
		const nameCell = document.createElement("td");
		nameCell.innerText = voter.name;
		rowElem.appendChild(nameCell);

		// Creates a cell element for the votes.
		const voteCell = document.createElement("td");
		voteCell.id = "vote-" + voter.name;
		voteCell.innerText = voter.status;
		rowElem.appendChild(voteCell);

		// Adds the new row to the voting table.
		tableElemVoter.appendChild(rowElem);

		// Creates an option for each candidate
		const candidateOption = document.createElement("option");
		candidateOption.value = index;
		candidateOption.innerText = voter.name;
		candidateOptions.appendChild(candidateOption);
	});

	$("#table-body-eleitor").show();
}

$("#btnSeeVoters").on('click', function () {
	voters = [];
	eleicao.methods.getVotersCount().call(async function (error, count) {
		console.log('count', count);
		for (i = 0; i < count; i++) {
			try {
				await eleicao.methods.getVoterFromId(i).call().then((data) => {
					var voter = {
						name: data[0],
						status: data[2]
					};
					voters.push(voter);
				});
			} catch (err) {
				console.log(err);
			}
		}

		populaVoters(voters);
	});
});