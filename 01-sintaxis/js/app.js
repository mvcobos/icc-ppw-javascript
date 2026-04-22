'use strict';

const nombre = 'Veronica';
const apellido = 'Cobos';
let ciclo = 5;
const activo = true;

const direccion = {
    ciudad: 'Cuenca',
    provincia: 'Azuay'
}

console.table({nombre, apellido, ciclo, activo, direccion});

//const calcularPromedio = (notas) => //promedio; notas.reduce => sum()

const esMayorEdad = (edad) => edad >= 18;

esMayorEdad(25);


const getSaludo2 = (nombre, hora) => hora < 12 
    ? `Buenos dias, ${nombre}`
    : hora < 18
        ? `Buenas tardes, ${nombre}`
        : `Buenas noches, ${nombre}`

//Mostrar en HTML
document.getElementById('nombre').textContent = `${nombrePrincipal}`;
document.getElementById('apellido').textContent = `${apellido}`;
document.getElementById('ci').textContent = `${nombrePrincipal}`;