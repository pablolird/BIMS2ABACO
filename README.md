<p align='center'>
  <img width="600" height="250" alt="BIMS2ABACO (1)" src="https://github.com/user-attachments/assets/eb0f0add-07b1-43da-959a-3610846fd10b" />
</p>

[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=000)](#)
[![HTML](https://img.shields.io/badge/HTML-%23E34F26.svg?logo=html5&logoColor=white)](#)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-%2338B2AC.svg?logo=tailwind-css&logoColor=white)](#)

# BIMS2ABACO - Convert BIMS spreadsheets to Abaco

BIMS2ABACO is a web-based tool that automates the process of converting BIMS spreadsheets to a format compatible with Abaco, two popular accounting software in Paraguay. This tool was created to streamline the workflow for accountants who need to transfer sales data from BIMS to Abaco, saving them time and effort from manual data manipulation.

## How it Works

The process is simple:

1.  **Upload your BIMS spreadsheet**: The tool accepts `.xlsx`, `.xls`, and `.csv` files.
2.  **"Timbrado" management**: The tool checks for "timbrados" (invoice identifiers) in the spreadsheet. If an expiration date for a "timbrado" is not found in the local storage, it will prompt the user to enter it. This information is then saved for future use. There is also a dedicated section to view, edit, and delete saved "timbrados".
3.  **Automatic conversion**: The tool automatically reformats the spreadsheet to match the Abaco format. This includes:
    * Reordering columns.
    * Renaming headers.
    * Inserting new columns with default values.
    * Performing necessary data transformations and calculations.
4.  **Download the result**: Once the processing is complete, you can download the Abaco-compatible spreadsheet.

## Features

* **User-friendly interface**: Simple and intuitive design for a smooth user experience.
* **Automatic spreadsheet conversion**: No more manual and tedious data manipulation.
* **"Timbrado" management**: Easily manage your "timbrados" and their expiration dates.
* **Secure and private**: All the processing is done in the browser, so your data never leaves your computer.
* **Cross-platform**: Being a web-based tool, it can be used on any operating system with a modern web browser.

## Getting Started

To use the tool, simply go to the <a href="https://pablolird.github.io/BIMS2ABACO/?">. Then, follow the on-screen instructions to convert your BIMS spreadsheet.

## Technologies Used

* **HTML**: For the structure of the web page.
* **Tailwind CSS**: For styling the user interface.
* **JavaScript**: For the core logic of the tool.
* **ExcelJS**: A JavaScript library for reading, manipulating, and writing spreadsheet data.

## Contributing

Contributions are welcome! If you have any ideas, suggestions, or bug reports, please feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
