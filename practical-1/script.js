const votes = { javascript: 0, python: 0, java: 0 };
        function vote(lang) {
            votes[lang]++;
            updateVotes();
        }
        function updateVotes() {
            document.getElementById('js-votes').textContent = votes.javascript;
            document.getElementById('py-votes').textContent = votes.python;
            document.getElementById('java-votes').textContent = votes.java;
        }
        setInterval(() => {
            const langs = ['javascript', 'python', 'java'];
            const randomLang = langs[Math.floor(Math.random() * langs.length)];
            votes[randomLang]++;
            updateVotes();
        }, 2000);