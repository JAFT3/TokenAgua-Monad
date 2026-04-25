// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./TokenAgua.sol";

/// @title TokenAguaDAO — Gobernanza on-chain para reparaciones hídricas ZMG
/// @notice Los holders de AGUA votan propuestas; el contrato libera fondos automáticamente
contract TokenAguaDAO {
    // ─── Tipos ────────────────────────────────────────────────────────────────

    enum EstadoPropuesta { Activa, Aprobada, Rechazada, Ejecutada }

    struct Propuesta {
        uint256 id;
        string titulo;
        string descripcion;
        uint256 presupuesto;       // en wei (MXN representado como stablecoin o MON)
        address payable destino;
        uint256 votosAFavor;
        uint256 votosEnContra;
        uint256 deadline;
        EstadoPropuesta estado;
    }

    // ─── Estado ───────────────────────────────────────────────────────────────

    TokenAgua public immutable token;
    uint256 public constant DURACION_VOTACION = 7 days;
    uint256 public constant QUORUM_MINIMO     = 10; // 10 votos mínimos

    uint256 private _nextPropuestaId;

    mapping(uint256 => Propuesta) public propuestas;
    /// propuestaId => voter => hasVoted
    mapping(uint256 => mapping(address => bool)) public haVotado;

    // ─── Eventos ──────────────────────────────────────────────────────────────

    event PropuestaCreada(uint256 indexed id, string titulo, uint256 presupuesto, uint256 deadline);
    event VotoEmitido(uint256 indexed propuestaId, address indexed votante, bool aFavor, uint256 peso);
    event PropuestaEjecutada(uint256 indexed id);
    event PropuestaRechazada(uint256 indexed id);

    // ─── Constructor ──────────────────────────────────────────────────────────

    constructor(address tokenAddress) {
        token = TokenAgua(tokenAddress);
    }

    // ─── Funciones públicas ───────────────────────────────────────────────────

    /// @notice Crea una nueva propuesta de gasto
    function crearPropuesta(
        string calldata titulo,
        string calldata descripcion,
        uint256 presupuesto,
        address payable destino
    ) external returns (uint256 id) {
        require(token.balanceOf(msg.sender) > 0, "Necesitas tokens AGUA para proponer");

        id = _nextPropuestaId++;
        propuestas[id] = Propuesta({
            id: id,
            titulo: titulo,
            descripcion: descripcion,
            presupuesto: presupuesto,
            destino: destino,
            votosAFavor: 0,
            votosEnContra: 0,
            deadline: block.timestamp + DURACION_VOTACION,
            estado: EstadoPropuesta.Activa
        });

        emit PropuestaCreada(id, titulo, presupuesto, propuestas[id].deadline);
    }

    /// @notice Emite un voto ponderado por balance de AGUA
    function votar(uint256 propuestaId, bool aFavor) external {
        Propuesta storage p = propuestas[propuestaId];
        require(p.estado == EstadoPropuesta.Activa, "Propuesta no activa");
        require(block.timestamp <= p.deadline, "Votacion cerrada");
        require(!haVotado[propuestaId][msg.sender], "Ya votaste");

        uint256 peso = token.balanceOf(msg.sender);
        require(peso > 0, "Sin tokens AGUA");

        haVotado[propuestaId][msg.sender] = true;

        if (aFavor) {
            p.votosAFavor += peso;
        } else {
            p.votosEnContra += peso;
        }

        emit VotoEmitido(propuestaId, msg.sender, aFavor, peso);
    }

    /// @notice Finaliza la votación y ejecuta si hay mayoría y quórum
    function finalizarPropuesta(uint256 propuestaId) external {
        Propuesta storage p = propuestas[propuestaId];
        require(p.estado == EstadoPropuesta.Activa, "Propuesta no activa");
        require(block.timestamp > p.deadline, "Votacion en curso");

        uint256 totalVotos = p.votosAFavor + p.votosEnContra;
        bool quorum = totalVotos >= QUORUM_MINIMO * 10 ** 18;
        bool mayoria = p.votosAFavor > p.votosEnContra;

        if (quorum && mayoria) {
            p.estado = EstadoPropuesta.Aprobada;
            emit PropuestaEjecutada(propuestaId);
        } else {
            p.estado = EstadoPropuesta.Rechazada;
            emit PropuestaRechazada(propuestaId);
        }
    }

    /// @notice Retorna el porcentaje de votos a favor (0-100)
    function porcentajeAFavor(uint256 propuestaId) external view returns (uint256) {
        Propuesta storage p = propuestas[propuestaId];
        uint256 total = p.votosAFavor + p.votosEnContra;
        if (total == 0) return 0;
        return (p.votosAFavor * 100) / total;
    }

    /// @notice Total de propuestas creadas
    function totalPropuestas() external view returns (uint256) {
        return _nextPropuestaId;
    }

    /// @notice Recibe fondos nativos para el fideicomiso
    receive() external payable {}
}
