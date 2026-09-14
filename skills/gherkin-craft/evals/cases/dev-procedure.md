# Prior context

Contexto previo: Queremos una aplicación para gestionar estos préstamos y comprobar el transporte. Las pruebas invocarán sus operaciones públicas; todavía no está implementada.

# Request

Usa gherkin-craft para convertir este procedimiento real en especificaciones nativas .feature en español. Solo está autorizado el préstamo del modelo C12: no añadas otros modelos, categorías admitidas ni administración de un catálogo. Entrega las especificaciones en output/ y señala únicamente las decisiones imprescindibles que falten. No implementes nada.

# Source material

Procedimiento construido para esta evaluación: préstamo de catalejos en una asociación de observación.

Solo se presta el modelo C12. Cada unidad tiene un identificador. Antes del préstamo se consulta si la unidad está disponible; consultar no reserva la unidad ni cambia su disponibilidad. Una unidad disponible puede estar inspeccionada o pendiente de inspección: son hechos independientes. Un préstamo solo se concede si la unidad está disponible, tiene la inspección vigente y el participante ha completado la orientación. Si falta uno de esos requisitos, se rechaza el préstamo, se identifica el requisito y se conserva la disponibilidad de la unidad. Si se concede, la unidad deja de estar disponible.

También se comprueba si el conjunto transportado cabe en el soporte del participante. El soporte admite como máximo 6 kg; se compara la masa total del conjunto, incluido el embalaje, con ese límite. Un conjunto de 5 kg cabe, uno de 6 kg cabe y uno de 7 kg no cabe. La masa del catalejo y la masa del embalaje se conocen por separado y la masa total es su suma. En un ejemplo, la unidad C12-07 tiene una masa de 4 kg y su embalaje tiene una masa de 2 kg. No se han definido conversiones entre unidades de masa.

La comprobación del soporte sirve para decidir qué transporte preparar; por sí sola no concede ni impide el préstamo. No agregues ese resultado como un requisito de concesión. No se describen devolución, recargos, plazos ni operaciones con otros modelos.
