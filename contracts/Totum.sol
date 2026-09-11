// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// ===== INTERFACES =====
interface IPanorToken {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function burn(uint256 amount) external;
}

interface IChainlinkOracle {
    function requestVerification(bytes32 _hash) external returns (bytes32);
    function getVerificationResult(bytes32 _requestId) external view returns (bool);
}

contract Totum {
    // ===== VARIABLES DE CONFIGURACIÓN =====
    address public direccionTokenPanor;
    address public chainlinkOracle;
    address public dueno;
    
    uint256 public costoRegistro = 100 * 10**18; // 100 PANOR
    uint256 public costoPropiedadIntelectual = 50 * 10**18; // 50 PANOR
    string public dominioBase = ".panor";
    
    // ===== ESTRUCTURAS =====
    struct Identidad {
        address dueno;
        string nombre;
        string dominio;
        string hashDocumento;
        bool estaVerificada;
        uint256 fechaRegistro;
        uint256 reputacion;
        bool tieneDominio;
        bytes32 chainlinkRequestId;
        bool verificadoPorChainlink;
    }

    struct PropiedadIntelectual {
        string titulo;
        string hashContenido;
        address creador;
        uint256 fechaRegistro;
        uint256 porcentajeCompartir; // 0, 25, 50, 100
        bool registrada;
        bytes32 chainlinkRequestId;
        bool verificadoPorChainlink;
        uint256 valoracion; // Reputación acumulada
    }

    // ===== MAPPINGS =====
    mapping(address => Identidad) public identidades;
    mapping(string => address) public dominios; // dominio.panor → dirección
    mapping(bytes32 => PropiedadIntelectual) public propiedadesIntelectuales;
    mapping(address => bytes32[]) public propiedadesPorUsuario;
    mapping(address => uint256) public reputacionUsuarios;
    mapping(bytes32 => bool) public verificacionesChainlink;
    mapping(address => bool) public estaRegistrado;

    // ===== EVENTOS =====
    event IdentidadRegistrada(
        address indexed usuario, 
        string nombre, 
        string dominio, 
        uint256 fecha,
        uint256 reputacion
    );
    
    event DominioRegistrado(string dominio, address indexed dueno);
    
    event PropiedadIntelectualRegistrada(
        bytes32 indexed hash, 
        address indexed creador, 
        string titulo,
        uint256 porcentajeCompartir
    );
    
    event ReputacionActualizada(address indexed usuario, uint256 nuevaReputacion);
    event ChainlinkVerificacionSolicitada(bytes32 indexed hash, bytes32 requestId);
    event ChainlinkVerificacionCompletada(bytes32 indexed hash, bool verificado);
    event CostoActualizado(string tipo, uint256 nuevoCosto);

    // ===== MODIFICADORES =====
    modifier soloDueno() {
        require(msg.sender == dueno, "Solo el dueno puede ejecutar");
        _;
    }

    modifier usuarioRegistrado(address _usuario) {
        require(estaRegistrado[_usuario], "Usuario no registrado");
        _;
    }

    // ===== CONSTRUCTOR =====
    constructor(address _direccionTokenPanor, address _chainlinkOracle) {
        require(_direccionTokenPanor != address(0), "Direccion del token invalida");
        direccionTokenPanor = _direccionTokenPanor;
        chainlinkOracle = _chainlinkOracle;
        dueno = msg.sender;
    }

    // ===== FUNCIONES PRINCIPALES =====

    // 1. Registrar Identidad con dominio .panor
    function registrarIdentidad(
        string memory _nombre,
        string memory _dominio,
        string memory _hashDocumento
    ) public {
        require(!estaRegistrado[msg.sender], "El usuario ya esta registrado");
        require(bytes(_nombre).length > 0 && bytes(_nombre).length <= 50, "Nombre invalido");
        require(bytes(_dominio).length > 0 && bytes(_dominio).length <= 30, "Dominio invalido");
        require(bytes(_hashDocumento).length > 0, "Hash requerido");
        
        // Validar caracteres del dominio (solo letras, números y guiones)
        string memory dominioCompleto = string(abi.encodePacked(_dominio, dominioBase));
        require(dominios[dominioCompleto] == address(0), "El dominio ya esta registrado");

        // Pagar con PANOR
        IPanorToken token = IPanorToken(direccionTokenPanor);
        require(token.transferFrom(msg.sender, address(this), costoRegistro), "Fondos PANOR insuficientes");
        
        // Quemar 10% del pago (mecanismo deflacionario)
        uint256 quemar = costoRegistro * 10 / 100;
        token.burn(quemar);

        // Solicitar verificación a Chainlink
        bytes32 requestId = bytes32(0);
        if (chainlinkOracle != address(0)) {
            requestId = IChainlinkOracle(chainlinkOracle).requestVerification(
                keccak256(abi.encodePacked(_hashDocumento, msg.sender, block.timestamp))
            );
        }

        identidades[msg.sender] = Identidad({
            dueno: msg.sender,
            nombre: _nombre,
            dominio: dominioCompleto,
            hashDocumento: _hashDocumento,
            estaVerificada: false,
            fechaRegistro: block.timestamp,
            reputacion: 0,
            tieneDominio: true,
            chainlinkRequestId: requestId,
            verificadoPorChainlink: false
        });

        dominios[dominioCompleto] = msg.sender;
        estaRegistrado[msg.sender] = true;

        emit IdentidadRegistrada(msg.sender, _nombre, dominioCompleto, block.timestamp, 0);
        emit DominioRegistrado(dominioCompleto, msg.sender);
        
        if (requestId != bytes32(0)) {
            emit ChainlinkVerificacionSolicitada(requestId, requestId);
        }
    }

    // 2. Registrar Propiedad Intelectual
    function registrarPropiedadIntelectual(
        string memory _titulo,
        string memory _hashContenido,
        uint256 _porcentajeCompartir
    ) public usuarioRegistrado(msg.sender) returns (bytes32) {
        require(bytes(_titulo).length > 0 && bytes(_titulo).length <= 100, "Titulo invalido");
        require(bytes(_hashContenido).length > 0, "Hash requerido");
        require(_porcentajeCompartir <= 100, "Porcentaje maximo 100%");

        bytes32 hashId = keccak256(abi.encodePacked(_hashContenido, msg.sender, block.timestamp));
        require(propiedadesIntelectuales[hashId].creador == address(0), "Propiedad ya registrada");

        // Pagar con PANOR
        IPanorToken token = IPanorToken(direccionTokenPanor);
        require(token.transferFrom(msg.sender, address(this), costoPropiedadIntelectual), "Fondos PANOR insuficientes");
        
        // Quemar 10%
        uint256 quemar = costoPropiedadIntelectual * 10 / 100;
        token.burn(quemar);

        // Solicitar verificación a Chainlink
        bytes32 requestId = bytes32(0);
        if (chainlinkOracle != address(0)) {
            requestId = IChainlinkOracle(chainlinkOracle).requestVerification(
                keccak256(abi.encodePacked(_hashContenido, msg.sender, block.timestamp))
            );
        }

        propiedadesIntelectuales[hashId] = PropiedadIntelectual({
            titulo: _titulo,
            hashContenido: _hashContenido,
            creador: msg.sender,
            fechaRegistro: block.timestamp,
            porcentajeCompartir: _porcentajeCompartir,
            registrada: true,
            chainlinkRequestId: requestId,
            verificadoPorChainlink: false,
            valoracion: 0
        });

        propiedadesPorUsuario[msg.sender].push(hashId);

        // Incrementar reputación (+10 por registrar propiedad)
        reputacionUsuarios[msg.sender] += 10;
        identidades[msg.sender].reputacion = reputacionUsuarios[msg.sender];

        emit PropiedadIntelectualRegistrada(hashId, msg.sender, _titulo, _porcentajeCompartir);
        emit ReputacionActualizada(msg.sender, reputacionUsuarios[msg.sender]);
        
        if (requestId != bytes32(0)) {
            emit ChainlinkVerificacionSolicitada(requestId, requestId);
        }
        
        return hashId;
    }

    // 3. Verificar identidad con Chainlink
    function verificarConChainlink(bytes32 _hash) public {
        require(chainlinkOracle != address(0), "Chainlink no configurado");
        bytes32 requestId = IChainlinkOracle(chainlinkOracle).requestVerification(_hash);
        verificacionesChainlink[requestId] = false;
        emit ChainlinkVerificacionSolicitada(_hash, requestId);
    }

    // 4. Callback de Chainlink
    function completarVerificacionChainlink(bytes32 _requestId, bool _verificado) public {
        require(msg.sender == chainlinkOracle, "Solo Chainlink puede llamar");
        verificacionesChainlink[_requestId] = _verificado;
        emit ChainlinkVerificacionCompletada(_requestId, _verificado);
    }

    // 5. Actualizar porcentaje de compartición
    function actualizarPorcentajeCompartir(bytes32 _hash, uint256 _nuevoPorcentaje) public {
        require(propiedadesIntelectuales[_hash].creador == msg.sender, "No eres el creador");
        require(_nuevoPorcentaje <= 100, "Porcentaje maximo 100%");
        propiedadesIntelectuales[_hash].porcentajeCompartir = _nuevoPorcentaje;
    }

    // 6. Valorar propiedad intelectual (reputación)
    function valorarPropiedad(bytes32 _hash, uint256 _puntuacion) public usuarioRegistrado(msg.sender) {
        require(propiedadesIntelectuales[_hash].registrada, "Propiedad no registrada");
        require(_puntuacion <= 5, "Puntuacion maxima 5");
        require(msg.sender != propiedadesIntelectuales[_hash].creador, "No puedes valorar tu propia propiedad");
        
        // Actualizar valoración promedio
        uint256 valoracionActual = propiedadesIntelectuales[_hash].valoracion;
        propiedadesIntelectuales[_hash].valoracion = (valoracionActual + _puntuacion) / 2;
        
        // Incrementar reputación del creador
        address creador = propiedadesIntelectuales[_hash].creador;
        reputacionUsuarios[creador] += 2;
        identidades[creador].reputacion = reputacionUsuarios[creador];
        
        emit ReputacionActualizada(creador, reputacionUsuarios[creador]);
    }

    // ===== FUNCIONES DE CONSULTA =====
    
    function obtenerIdentidad(address _usuario) public view returns (Identidad memory) {
        return identidades[_usuario];
    }

    function obtenerIdentidadPorDominio(string memory _dominio) public view returns (address) {
        string memory dominioCompleto = string(abi.encodePacked(_dominio, dominioBase));
        return dominios[dominioCompleto];
    }

    function obtenerPropiedad(bytes32 _hash) public view returns (PropiedadIntelectual memory) {
        return propiedadesIntelectuales[_hash];
    }

    function obtenerPropiedadesUsuario(address _usuario) public view returns (bytes32[] memory) {
        return propiedadesPorUsuario[_usuario];
    }

    function obtenerReputacion(address _usuario) public view returns (uint256) {
        return reputacionUsuarios[_usuario];
    }

    function verificarSiRegistrado(address _usuario) public view returns (bool) {
        return estaRegistrado[_usuario];
    }

    // ===== FUNCIONES DE ADMIN =====
    
    function cambiarCostoRegistro(uint256 _nuevoCosto) public soloDueno {
        costoRegistro = _nuevoCosto;
        emit CostoActualizado("Registro", _nuevoCosto);
    }

    function cambiarCostoPropiedad(uint256 _nuevoCosto) public soloDueno {
        costoPropiedadIntelectual = _nuevoCosto;
        emit CostoActualizado("Propiedad", _nuevoCosto);
    }

    function actualizarChainlinkOracle(address _nuevoOracle) public soloDueno {
        chainlinkOracle = _nuevoOracle;
    }

    function retirarPanor(uint256 _cantidad) public soloDueno {
        IPanorToken token = IPanorToken(direccionTokenPanor);
        require(token.transfer(dueno, _cantidad), "Transferencia fallida");
    }

    function verificarIdentidad(address _usuario) public soloDueno {
        require(estaRegistrado[_usuario], "Usuario no registrado");
        identidades[_usuario].estaVerificada = true;
    }
}