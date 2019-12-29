var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Medico = require('../models/medico');


// Rutas

// ===============================
//	Obtener todas los medicos
// ===============================

app.get('/', (req, res) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({}, 'nombre usuario hospital img')
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital', 'nombre')
        .exec(
            (err, medicos) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al buscar medicos',
                        errors: err
                    });
                }

                Medico.count({}, (err, count) => {
                    res.status(200).json({
                        ok: true,
                        medicos: medicos,
                        total: count
                    });
                });



            }
        );
});


// ===============================
//	Actualizar medico
// ===============================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un medico con ese ID',
                errors: { message: 'No existe un medico con ese ID' }
            });
        }

        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospitalId;

        medico.save((err, medicoGuardado) => {

            if (err) {
                return res.status(422).json({
                    ok: false,
                    mensaje: 'Error al crear medico',
                    error: err
                });
            }

            medicoGuardado.password = '';

            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });

        });

    });

});

// ===============================
//	Crear nuevo medico
// ===============================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospitalId
    });

    medico.save((err, medicoGuardado) => {

        if (err) {
            return res.status(422).json({
                ok: false,
                mensaje: 'Error al crear medico',
                error: err
            });
        }

        medicoGuardado.password = '';

        res.status(201).json({
            ok: true,
            medico: medicoGuardado
        });

    });

});


//
//	Borrar medico por el id
//
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al eliminar medico',
                errors: err
            });
        }

        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un medico con ese ID',
                errors: { message: 'No existe un medico con ese ID' }
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });

    });
});

module.exports = app;