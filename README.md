# PDF and Excel Checker

This project was created to automate a specific task that I used to perform manually. The goal is to check the status of patients listed in a PDF file by comparing them with an Excel file that contains information about the patients' statuses.

## Project Purpose

I frequently needed to manually check the status of various patients in a PDF and compare them with a status list in an Excel file. This project automates this process by extracting patient names from the PDF and comparing them with the Excel data, displaying the status of each patient.

## Features

- Upload PDF and Excel files.
- Extract patient names from the PDF.
- Check the status of patients in the Excel file.
- Display the results with color coding for easy visualization:
  - Green for active patients.
  - Red for inactive patients.
  - Orange for patients not found.

## Technologies Used

- HTML
- CSS
- JavaScript
- Bootstrap
- PDF.js
- SheetJS
- Jest

## How It Works

1. The user uploads a PDF file containing patient information.
2. The user uploads an Excel file containing the names of patients and their respective statuses.
3. The application extracts patient names from the PDF.
4. The application checks each extracted name in the Excel file to determine the patient's status.
5. The application displays the results, indicating whether each patient is active, inactive, or not found in the list.

## Notes

This project was developed for my personal use and addresses a specific need to automate a repetitive task. It is unlikely to be useful to others unless they have the exact same format of PDF and Excel files.
