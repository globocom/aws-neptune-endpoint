(function () {
    const spinner = document.getElementById("spinner");
    const result = document.getElementById("result");
    const query = document.getElementById("query");
    const error = document.getElementById("error");

    const isExecuteQueryButton = (event) =>
        event.target.matches("#execute-query");
    const toggleSpinner = () => {
        spinner.classList.toggle("d-none");
    };
    const updateResult = (data) => {
        result.innerHTML = data;
    };
    const updateError = (data) => {
        error.innerHTML = data;
    };
    const formatResultTable = (tableObject) => {
        const div = document.createElement("div");
        div.innerHTML = tableObject;
        div.getElementsByTagName("table")[0].classList.add(
            "table",
            "table-sm",
            "table-bordered",
            "table-striped",
            "table-hover"
        );
        div.getElementsByTagName("thead")[0].classList.toggle("table-light");
        return div.childNodes[0].outerHTML;
    };

    const executeQuery = async () => {
        const options = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: query.value }),
        };
        try {
            const response = await fetch("/query", options);
            if (response.ok) {
                const text = await response.text();
                updateResult(formatResultTable(text));
            } else {
                const json = await response.json();
                updateError(JSON.stringify(json, null, 4));
            }
        } catch (err) {
            updateError(err);
        } finally {
            toggleSpinner();
        }
    };

    // code adapted from https://stackoverflow.com/a/6637396/3866300
    query.addEventListener("keydown", (e) => {
        if (e.key === "Tab") {
            e.preventDefault();
            const start = this.selectionStart;
            const end = this.selectionEnd;

            this.value =
                this.value.substring(0, start) +
                "\t" +
                this.value.substring(end);

            this.selectionStart = this.selectionEnd = start + 1;
        }
    });

    document.addEventListener(
        "click",
        (event) => {
            if (!isExecuteQueryButton(event)) return;

            event.preventDefault();

            toggleSpinner();
            updateResult("");
            updateError("");
            executeQuery();
        },
        false
    );
})();
