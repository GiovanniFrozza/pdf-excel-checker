const pdfUpload = document.getElementById('pdfUpload');
const excelUpload = document.getElementById('excelUpload');
const loadingIndicator = document.getElementById('loading');
const resultContainer = document.getElementById('result');

async function checkPatientStatus() {
	const pdfFile = pdfUpload.files[0];
	const excelFile = excelUpload.files[0];

	if (!pdfFile || !excelFile) {
		setResultText("Please upload both PDF and Excel files.");
		return;
	}

	showLoading(true);
	clearResult();

	try {
		const pdfText = await extractTextFromPDF(pdfFile);
		const patients = await extractPatientsFromExcel(excelFile);
		const patientNames = findPatientNames(pdfText);

		const resultHtml = generateResultHtml(patientNames, patients);
		setResultHtml(resultHtml);

	} catch (error) {
		console.error("Error during execution:", error);
		setResultText("An error occurred during processing. Check console for details.");
	} finally {
		showLoading(false);
	}
};

async function extractTextFromPDF(pdfFile) {
	const pdfjsLib = window['pdfjs-dist/build/pdf'];
	const arrayBuffer = await pdfFile.arrayBuffer();
	const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
	const pdf = await loadingTask.promise;
	let text = "";

	for (let i = 1; i <= pdf.numPages; i++) {
		const page = await pdf.getPage(i);
		const textContent = await page.getTextContent();
		const strings = textContent.items.map(item => item.str);
		text += strings.join(' ') + '\n';
	}

	return text;
};

async function extractPatientsFromExcel(excelFile) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = function (event) {
			try {
				const data = new Uint8Array(event.target.result);
				const workbook = XLSX.read(data, { type: 'array' });
				const sheet = workbook.Sheets[workbook.SheetNames[0]];
				const patients = XLSX.utils.sheet_to_json(sheet);
				resolve(patients);
			} catch (error) {
				reject(error);
			}
		};
		reader.onerror = function (event) {
			reject(event.target.error);
		};
		reader.readAsArrayBuffer(excelFile);
	});
};

function findPatientNames(pdfText) {
	const regex = /Paciente: [\d\s.]+- ([A-Za-z\s]+)/g;
	const matches = [];
	let match;

	while ((match = regex.exec(pdfText)) !== null) {
		matches.push(match[1].trim());
	}

	return matches;
};

function generateResultHtml(patientNames, patients) {
	return patientNames.map(patientName => {
		const patientStatus = checkPatientInList(patientName, patients);
		const statusClass = patientStatus === "ATIVO" ? "text-success" :
			patientStatus === "INATIVO" ? "text-danger" : "text-warning";
		return `<div class="patient ${statusClass}">${patientName}`;
	}).join('<hr class="my-2">');
};

function checkPatientInList(patientName, patients) {
	const patient = patients.find(p => p.nome.trim().toUpperCase() === patientName.toUpperCase());
	return patient ? patient.situacao : "not found";
};

function setResultHtml(html) {
	resultContainer.innerHTML = html;
};

function setResultText(text) {
	resultContainer.innerText = text;
};

function clearResult() {
	resultContainer.innerHTML = '';
};

function showLoading(show) {
	loadingIndicator.style.display = show ? 'block' : 'none';
};

function clearUploads() {
	pdfUpload.value = '';
	excelUpload.value = '';
};

document.getElementById('checkStatusButton').addEventListener('click', checkPatientStatus);
document.getElementById('clearResultsButton').addEventListener('click', () => {
	clearResult();
	clearUploads();
});