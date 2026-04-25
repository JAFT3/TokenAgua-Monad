// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title TokenAgua — Token de utilidad para gestión hídrica ZMG
/// @notice Ciudadanos ganan AGUA por reportar fugas validadas en Monad Testnet
contract TokenAgua is ERC20, Ownable {
    // ─── Tipos ────────────────────────────────────────────────────────────────

    enum Severidad { Leve, Media, Grave }
    enum EstadoReporte { Pendiente, Validado, Rechazado }

    struct Reporte {
        uint256 id;
        address reportador;
        string colonia;
        string direccion;
        Severidad severidad;
        string descripcion;
        EstadoReporte estado;
        uint256 timestamp;
        uint256 recompensa;
    }

    // ─── Estado ───────────────────────────────────────────────────────────────

    uint256 public constant RECOMPENSA_LEVE  = 50  * 10 ** 18;
    uint256 public constant RECOMPENSA_MEDIA = 100 * 10 ** 18;
    uint256 public constant RECOMPENSA_GRAVE = 200 * 10 ** 18;

    /// Número de reportes convergentes necesarios para liberar fondos
    uint256 public constant REPORTES_CONVERGENTES = 3;

    uint256 private _nextReporteId;

    mapping(uint256 => Reporte) public reportes;
    /// colonia => lista de ids de reportes pendientes
    mapping(string => uint256[]) public reportesPorColonia;
    /// Validadores autorizados (oráculos / SIAPA)
    mapping(address => bool) public esValidador;

    // ─── Eventos ──────────────────────────────────────────────────────────────

    event FugaReportada(
        uint256 indexed id,
        address indexed reportador,
        string colonia,
        Severidad severidad,
        uint256 recompensa
    );
    event ReporteValidado(uint256 indexed id, address indexed validador);
    event ReporteRechazado(uint256 indexed id, address indexed validador);
    event ValidadorActualizado(address indexed validador, bool estado);

    // ─── Constructor ──────────────────────────────────────────────────────────

    constructor(address initialOwner) ERC20("TokenAgua", "AGUA") Ownable(initialOwner) {
        // Mint inicial para el fondo de recompensas (1M AGUA)
        _mint(address(this), 1_000_000 * 10 ** 18);
    }

    // ─── Modificadores ────────────────────────────────────────────────────────

    modifier soloValidador() {
        require(esValidador[msg.sender] || msg.sender == owner(), "No autorizado");
        _;
    }

    // ─── Funciones públicas ───────────────────────────────────────────────────

    /// @notice Reporta una fuga y reserva la recompensa correspondiente
    function reportarFuga(
        string calldata colonia,
        string calldata direccion,
        Severidad severidad,
        string calldata descripcion
    ) external returns (uint256 id) {
        id = _nextReporteId++;
        uint256 recompensa = _calcularRecompensa(severidad);

        reportes[id] = Reporte({
            id: id,
            reportador: msg.sender,
            colonia: colonia,
            direccion: direccion,
            severidad: severidad,
            descripcion: descripcion,
            estado: EstadoReporte.Pendiente,
            timestamp: block.timestamp,
            recompensa: recompensa
        });

        reportesPorColonia[colonia].push(id);

        emit FugaReportada(id, msg.sender, colonia, severidad, recompensa);
    }

    /// @notice Valida un reporte y transfiere la recompensa al ciudadano
    function validarReporte(uint256 id) external soloValidador {
        Reporte storage r = reportes[id];
        require(r.estado == EstadoReporte.Pendiente, "Reporte no pendiente");

        r.estado = EstadoReporte.Validado;
        _transfer(address(this), r.reportador, r.recompensa);

        emit ReporteValidado(id, msg.sender);
    }

    /// @notice Rechaza un reporte inválido
    function rechazarReporte(uint256 id) external soloValidador {
        Reporte storage r = reportes[id];
        require(r.estado == EstadoReporte.Pendiente, "Reporte no pendiente");
        r.estado = EstadoReporte.Rechazado;
        emit ReporteRechazado(id, msg.sender);
    }

    /// @notice Retorna todos los reportes de una colonia
    function getReportesPorColonia(string calldata colonia)
        external view returns (uint256[] memory)
    {
        return reportesPorColonia[colonia];
    }

    /// @notice Total de reportes creados
    function totalReportes() external view returns (uint256) {
        return _nextReporteId;
    }

    // ─── Admin ────────────────────────────────────────────────────────────────

    function setValidador(address validador, bool estado) external onlyOwner {
        esValidador[validador] = estado;
        emit ValidadorActualizado(validador, estado);
    }

    /// @notice Permite al owner recargar el fondo de recompensas
    function recargarFondo(uint256 cantidad) external onlyOwner {
        _mint(address(this), cantidad);
    }

    // ─── Interno ──────────────────────────────────────────────────────────────

    function _calcularRecompensa(Severidad s) internal pure returns (uint256) {
        if (s == Severidad.Leve)  return RECOMPENSA_LEVE;
        if (s == Severidad.Media) return RECOMPENSA_MEDIA;
        return RECOMPENSA_GRAVE;
    }
}
