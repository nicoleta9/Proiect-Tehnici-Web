window.onload = function () {
   // Referințe elemente DOM
    var sectiuneLogin = document.getElementById('sectiune-login');
    var sectiuneQuiz = document.getElementById('sectiune-quiz');
    var mesajBunvenit = document.getElementById('mesaj-bunvenit');
    var btnLogin = document.getElementById('btn-login');
    var btnLogout = document.getElementById('btn-logout');
    var mesajEroare = document.getElementById('mesaj-eroare');
    
    var btnStart = document.getElementById('start_btn');
    var container = document.querySelector('.continut');

    // 1. Verificăm dacă există deja cineva logat în localStorage
    var utilizatorLogat = localStorage.getItem('userNostalgia');

    if (utilizatorLogat) {
        afiseazaInterfataQuiz(utilizatorLogat);
    }

    // 2. Login
    btnLogin.onclick = function() {
        var nume = document.getElementById('username').value;
        var cod = document.getElementById('parola').value;

        // Regex: Numele să înceapă cu literă mare, minim 3 caractere
        var regexNume = /^[A-Z][a-zA-Z]{2,}$/;
        // Regex: Cod acces format XX-0000 
        var regexCod = /^[A-Z]{2}-[0-9]{4}$/;

        if (!regexNume.test(nume)) {
            mesajEroare.textContent = "Utilizator invalid! ( Prima litera trebuie sa fie mare iar numele trebuie sa aiba minim 3 caractere )";
        } else if (!regexCod.test(cod)) {
            mesajEroare.textContent = "Cod invalid! (Format cerut: XX-0000, ex: TV-2024)";
        } else {
            // Validare reușită
            localStorage.setItem('userNostalgia', nume);
            afiseazaInterfataQuiz(nume);
        }
    };

    // 3. Logout    
    btnLogout.onclick = function() {
        localStorage.removeItem('userNostalgia');
        location.reload(); // Reîncărcăm pagina pentru a reveni la meniul de login
    };

    function afiseazaInterfataQuiz(nume) {
        sectiuneLogin.style.display = 'none';
        sectiuneQuiz.style.display = 'block';
        mesajBunvenit.textContent = "Bine ai venit, " + nume + "!";
    }


    var intrebari = [];
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            intrebari = JSON.parse(this.responseText);
        }
    };
    xhttp.open("GET", "intrebari.json", true);
    xhttp.send();

btnStart.onclick = function(e) {
    e.stopPropagation();
    
    var stilButon = window.getComputedStyle(btnStart);
    console.log("Butonul de start are culoarea: " + stilButon.backgroundColor);

    if (intrebari.length === 0) {
        alert("Încă se încarcă întrebările...");
        return;
    }
    document.getElementById('text-surpriza').style.display = 'none';
    document.getElementById('btn-logout').style.display = 'none';
    startJoc();
};

    function startJoc() {
        indexCurent = 0;
        scor = 0;

        intrebariSelectate = intrebari.sort(function() {
            return 0.5 - Math.random();
        }).slice(0, 3);

        btnStart.style.display = 'none';
        afiseazaIntrebare();
    }

    function afiseazaIntrebare() {
        const elementeVechi = container.querySelectorAll('.quiz-element');

        for (let i = 0; i < elementeVechi.length; i++) {
            elementeVechi[i].remove();
        }

        if (indexCurent < intrebariSelectate.length) {
            const p = document.createElement('p');
            p.className = 'quiz-element';
            p.textContent = (indexCurent + 1) + ": " + intrebariSelectate[indexCurent].q;

            const input = document.createElement('input');
            input.type = 'text';
            input.id = 'searchbar'; 
            input.className = 'quiz-element';
            input.placeholder = 'Răspunsul tău...';

            const btnSubm = document.createElement('input');
            btnSubm.type = 'submit';
            btnSubm.id = 'subm';
            btnSubm.className = 'quiz-element';
            btnSubm.value = 'Submit';

            container.appendChild(p);
            container.appendChild(input);
            container.appendChild(btnSubm);

            btnSubm.onclick = function () {
                const raspunsUtilizator = input.value.trim().toLowerCase();
                const raspunsuriCorecte = intrebariSelectate[indexCurent].a;

                if (raspunsuriCorecte.includes(raspunsUtilizator)) {
                    scor++;
                }

                indexCurent++;
                afiseazaIntrebare();
            };
        } else {
            finalizareQuiz();
        }
    }

    function finalizareQuiz() {
    // Curățăm ecranul de întrebări 
    var elementeVechi = container.querySelectorAll('.quiz-element');
    for (var i = 0; i < elementeVechi.length; i++) {
        elementeVechi[i].remove();
    }

    //  Creăm mesajul de final
    var mesajFinal = document.createElement('h3');
    mesajFinal.className = 'quiz-element';
    mesajFinal.style.marginTop = "20px";

    if (scor === 3) {
        mesajFinal.textContent = "Felicitări! Ai răspuns corect la toate întrebările (3/3)!";
        deseneazaTrofeuCanvas(); 
        insereazaMedalieSVG();
    } else {
        mesajFinal.textContent = "Ai terminat! Scor: " + scor + "/3";

    container.style.backgroundColor = "#c22741ee";
    setTimeout(function() {
    container.style.backgroundColor = ""; 
}, 1000);
    }

    // Aplicăm culoarea aleatorie pe text
    mesajFinal.style.color = "rgb(" + Math.floor(Math.random()*256) + "," + Math.floor(Math.random()*256) + "," + Math.floor(Math.random()*256) + ")";
    container.appendChild(mesajFinal);

    var btnRestart = document.createElement('button');
    btnRestart.textContent = "Încearcă din nou";
    
    btnRestart.id = "start_btn"; 
    btnRestart.className = "quiz-element"; 
    btnRestart.style.display = "block";
    btnRestart.style.margin = "20px auto";

    btnRestart.onclick = function() {
        // Ascundem elementele grafice înainte de restart
        var canvas = document.getElementById('canvas-premiu');
        if(canvas) canvas.style.display = 'none';
        
        document.body.style.backgroundColor = "";
        
        startJoc();
    };

    container.appendChild(btnRestart);

    // Reafișăm butonul de Logout
    document.getElementById('btn-logout').style.display = 'inline-block';
}
    
    // Eveniment de tastatură: Ieșire din quiz la apăsarea tastei q
    window.onkeydown = function(event) {
        // Verificăm dacă tasta apăsată este 'q' sau 'Q'
        // De asemenea, verificăm să nu fim în interiorul input-ului de text (ca să poți scrie cuvinte care conțin 'q')
        if ((event.key === 'q' || event.key === 'Q') && event.target.id !== 'searchbar') {
            iesireQuiz();
        }
    };

  function iesireQuiz() {
    //  Curățăm elementele dinamice 
    var elementeVechi = container.querySelectorAll('.quiz-element');
    for (var i = 0; i < elementeVechi.length; i++) {
        elementeVechi[i].remove();
    }

    // 2. Reafișăm containerele principale
    var zonaStart = document.getElementById('zona-start-quiz');
    if (zonaStart) {
        zonaStart.style.display = 'block';
        // Ne asigurăm că și titlul h3 din interior reapare
        var titluH3 = zonaStart.querySelector('h3');
        if (titluH3) titluH3.style.display = 'block';
    }

    // 3. Reafișăm butoanele specifice
    if (btnStart) {
        btnStart.style.display = 'inline-block';
    }
    
    var btnLogOut = document.getElementById('btn-logout');
    if (btnLogOut) {
        btnLogOut.style.display = 'inline-block';
    }

    var textSurpriza = document.getElementById('text-surpriza');
    if (textSurpriza) {
        textSurpriza.style.display = 'block';
    }

    // 4. Resetăm scorul
    indexCurent = 0;
    scor = 0;

}

function insereazaMedalieSVG() {
    // Creăm elementul SVG folosind Namespace-ul obligatoriu
    var svgNS = "http://www.w3.org/2000/svg";
    var svgMedalie = document.createElementNS(svgNS, "svg");
    svgMedalie.setAttribute("width", "100");
    svgMedalie.setAttribute("height", "100");
    svgMedalie.setAttribute("class", "quiz-element");

    // Adăugăm un cerc (medalia)
    var cerc = document.createElementNS(svgNS, "circle");
    cerc.setAttribute("cx", "50");
    cerc.setAttribute("cy", "50");
    cerc.setAttribute("r", "30");
    cerc.setAttribute("fill", "#FFD700"); // Galben auriu
    cerc.setAttribute("stroke", "orange");
    cerc.setAttribute("stroke-width", "4");

    // Adăugăm un text în interiorul SVG-ului
    var textSvg = document.createElementNS(svgNS, "text");
    textSvg.setAttribute("x", "50");
    textSvg.setAttribute("y", "55");
    textSvg.setAttribute("text-anchor", "middle");
    textSvg.setAttribute("fill", "black");
    textSvg.setAttribute("font-size", "20");
    textSvg.setAttribute("font-weight", "bold");
    textSvg.textContent = "1";

    svgMedalie.appendChild(cerc);
    svgMedalie.appendChild(textSvg);
    
    // Îl adăugăm în container sub mesajul de felicitare
    container.appendChild(svgMedalie);
}

function deseneazaTrofeuCanvas() {
        var canvas = document.getElementById('canvas-premiu');
        if(!canvas) return; 
        canvas.style.display = "block";
        var ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "gold";
        ctx.fillRect(75, 100, 50, 10); // Baza
        ctx.fillRect(95, 70, 10, 30);  // Picior
        ctx.beginPath();
        ctx.arc(100, 50, 30, 0, Math.PI * 2); // Cupa
        ctx.fill();
    }
};
