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
		const [pdfText, patients] = await Promise.all([
			extractTextFromPDF(pdfFile),
			extractPatientsFromExcel(excelFile)
		]);

		const patientNames = findPatientNames(pdfText);
		const resultHtml = generateResultHtml(patientNames, patients);

		setResultHtml(resultHtml);

	} catch (error) {
		console.error("Error during execution:", error);
		setResultText("An error occurred during processing. Check console for details.");
	} finally {
		showLoading(false);
	}
}

async function extractTextFromPDF(pdfFile) {
	const pdfjsLib = window['pdfjs-dist/build/pdf'];
	const arrayBuffer = await pdfFile.arrayBuffer();
	const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
	const pdf = await loadingTask.promise;

	const pageTexts = await Promise.all(
		Array.from({ length: pdf.numPages }, (_, i) => pdf.getPage(i + 1).then(page => page.getTextContent()))
	);

	const text = pageTexts.map(textContent => {
		const strings = textContent.items.map(item => item.str);
		return strings.join(' ');
	}).join('\n');

	console.log("Texto extraído do PDF:", text);
	return text;
}

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
		reader.onerror = reject;
		reader.readAsArrayBuffer(excelFile);
	});
}

function findPatientNames(pdfText) {
	const regex = /Paciente: [\d\s.]+- ([A-Za-z\s]+)/g;
	const matches = [];
	let match;

	while ((match = regex.exec(pdfText)) !== null) {
		const patientName = normalizeString(match[1].trim());
		matches.push(patientName);
	}

	return matches;
}

function normalizeString(str) {
	return str.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/ç/g, "c")
		.replace(/Ç/g, "C")
		.toUpperCase();
}

function generateResultHtml(patientNames, patients) {
	return patientNames.map(patientName => {
		const normalizedPatientName = normalizeString(patientName);

		const matchingPatients = patients.filter(p =>
			normalizeString((p.nome || '').trim()).includes(normalizedPatientName)
		);

		if (matchingPatients.length > 0) {
			const fullName = matchingPatients[0].nome.trim(); // Nome completo do paciente
			const patientStatus = matchingPatients.some(p =>
				normalizeString(p.situacao.trim()) === "ATIVO"
			) ? "ATIVO" : matchingPatients[0].situacao;

			const statusClass = patientStatus === "ATIVO" ? "text-success" :
				patientStatus === "INATIVO" ? "text-danger" : "text-warning";

			return `<div class="patient ${statusClass}">${fullName} </div>`;
		} else {
			return `<div class="patient text-warning">${patientName} </div>`;
		}
	}).join('<hr class="my-2">');
}


function checkPatientInList(patientName, patients) {
	const normalizedPatientName = normalizeString(patientName);

	const matchingPatients = patients.filter(p =>
		normalizeString(p.nome.trim()).includes(normalizedPatientName)
	);

	const isAtivo = matchingPatients.some(p =>
		normalizeString(p.situacao.trim()) === "ATIVO"
	);

	if (isAtivo) {
		return "ATIVO";
	} else {
		return matchingPatients.length > 0 ? matchingPatients[0].situacao : "not found";
	}
}

function setResultHtml(html) {
	resultContainer.innerHTML = html;
}

function setResultText(text) {
	resultContainer.innerText = text;
}

function clearResult() {
	resultContainer.innerHTML = '';
}

function showLoading(show) {
	loadingIndicator.style.display = show ? 'block' : 'none';
}

function clearUploads() {
	pdfUpload.value = '';
	excelUpload.value = '';
}

document.getElementById('checkStatusButton').addEventListener('click', checkPatientStatus);
document.getElementById('clearResultsButton').addEventListener('click', () => {
	clearResult();
	clearUploads();
});
