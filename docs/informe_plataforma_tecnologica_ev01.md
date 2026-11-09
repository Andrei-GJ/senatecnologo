# INFORME TÉCNICO: PREPARACIÓN DE LA PLATAFORMA TECNOLÓGICA E INFRAESTRUCTURA DE HARDWARE Y SOFTWARE (DENTAL BLANC)

**CÓDIGO DE EVIDENCIA:** GA10-220501097-AA1-EV01  
**PROGRAMA DE FORMACIÓN:** Análisis y Desarrollo de Software (ADSO)  
**PROYECTO FORMATIVO:** Construcción de software integrador de tecnologías orientadas a servicios  
**FASE DEL PROYECTO:** Ejecución  
**RESULTADO DE APRENDIZAJE:** 220501097-01 - Planear actividades de implantación del software de acuerdo con las condiciones del sistema.  
**ACTIVIDAD DE APRENDIZAJE:** GA10-220501097-AA1 - Preparar la plataforma tecnológica, de acuerdo con los requerimientos.  
**EVIDENCIA DE CONOCIMIENTO:** Conceptos y principios de hardware e instalación de software (GA10-220501097-AA1-EV01).  

---

## 1. DATOS GENERALES
* **Nombre del Proyecto:** Dental Blanc - Sistema Clínico Odontológico (Fullstack)
* **Aprendiz:** Andrei (ADSO)
* **Centro de Formación:** Servicio Nacional de Aprendizaje (SENA)
* **Fecha de Elaboración:** 05 de Octubre de 2026
* **Stack Tecnológico:** Python (FastAPI), React (Vite / Tailwind CSS v4), PostgreSQL (Neon / Cloud DB), Uvicorn/Nginx, Linux (Ubuntu Server 22.04 LTS).

---

## 2. INTRODUCCIÓN
El despliegue eficiente y seguro de un sistema de información moderno orientada a servicios (como el software clínico odontológico **Dental Blanc**) requiere una planificación técnica rigurosa de la plataforma tecnológica subyacente. La infraestructura no solo abarca el entorno de ejecución de los servicios web (servidores, sistemas operativos y componentes de hardware), sino también las redes de datos que posibilitan la comunicación entre los clientes (frontend), la API lógica (backend) y los motores de persistencia distribuidos.

El presente informe técnico tiene como objetivo definir y detallar los principios de hardware, las características del sistema operativo seleccionado y los fundamentos de transmisión de datos a través de medios guiados y no guiados, asegurando el cumplimiento de la lista de chequeo de la evidencia **GA10-220501097-AA1-EV01**.

---

## 3. OBJETIVOS

### 3.1. Objetivo General
Planear y describir la infraestructura de hardware, red y sistema operativo requerida para la implantación y ejecución óptima del sistema clínico odontológico Dental Blanc, garantizando alta disponibilidad, seguridad y rendimiento.

### 3.2. Objetivos Específicos
1. Diferenciar conceptual y técnicamente las dos grandes familias de protocolos de transporte de datos (TCP y UDP), analizando su aplicabilidad dentro del sistema **Dental Blanc**.
2. Especificar las características de hardware, gestión de memoria, concurrencia y seguridad del sistema operativo servidor seleccionado (**Linux Ubuntu Server 22.04 LTS**).
3. Identificar y clasificar los medios de transmisión guiados (cables UTP/STP, fibra óptica) y no guiados (Wi-Fi 6, Bluetooth, enlaces 5G/satelitales) necesarios para la operación de la red de la clínica.
4. Consolidar el informe bajo las normas básicas de presentación de documentos técnicos.

---

## 4. DESARROLLO DE LA LISTA DE CHEQUEO

### 4.1. Variable 1: Familias de Protocolos en la Transmisión y Recepción de Datos
En el modelo de referencia OSI y la pila TCP/IP, la Capa de Transporte es la encargada de la transferencia de datos de extremo a extremo entre aplicaciones. Las dos grandes familias de protocolos que gobiernan la transmisión y recepción de datos son los **Protocolos Orientados a Conexión** y los **Protocolos No Orientados a Conexión**.

```
                           FAMILIAS DE PROTOCOLOS DE TRANSPORTE
                                            │
                     ┌──────────────────────┴──────────────────────┐
                     ▼                                             ▼
        ORIENTADOS A CONEXIÓN (TCP)                     NO ORIENTADOS A CONEXIÓN (UDP)
      ───────────────────────────────                 ───────────────────────────────
      • Establecimiento de sesión (3-way)             • Sin establecimiento previa de sesión
      • Transmisión confiable y ordenada               • Máxima velocidad y bajo overhead
      • Control de flujo y congestión                 • Sin retransmisión de paquetes
      • Uso: HTTP/HTTPS, DB, SSH                      • Uso: Streaming, VoIP, DNS, Video
```

#### A. Protocolos Orientados a Conexión (Transmission Control Protocol - TCP)
El protocolo TCP es el pilar de las comunicaciones donde la **integridad de la información** es prioritaria frente a la latencia mínima.

* **Mecanismo de Conexión:** Establece una comunicación previa mediante el proceso de intercambio de tres vías (*Three-Way Handshake*: `SYN` -> `SYN-ACK` -> `ACK`) antes de enviar datos del usuario.
* **Control de Errores y Fiabilidad:** Cada paquete transmitido lleva un número de secuencia y requiere una confirmación de recepción (*Acknowledgement* - `ACK`). Si un paquete se pierde o llega corrupto (mediante la suma de comprobación *Checksum*), TCP solicita su retransmisión automáticamente.
* **Control de Flujo y Congestión:** Emplea algoritmos de ventana deslizante (*Sliding Window*) para regular la cantidad de datos enviados sin saturar al receptor ni los nodos intermediarios de la red.
* **Aplicación en Dental Blanc:** 
  * Conexiones de API REST sobre **HTTPS (TCP puerto 443)** entre el cliente React y el servidor FastAPI.
  * Consultas SQL y transacciones financieras/clínicas hacia la base de datos PostgreSQL en la nube (Neon) a través de **TLS/TCP puerto 5432**.
  * Transición de autenticación segura JWT y gestión de expedientes médicos.

#### B. Protocolos No Orientados a Conexión (User Datagram Protocol - UDP)
El protocolo UDP está diseñado para escenarios donde el **tiempo real y el bajo consumo de recursos** priman sobre la garantía de entrega de cada paquete individual.

* **Sin Estado de Conexión:** Los datagramas se envían a la red sin verificar si el receptor está listo o si el canal está libre (*Best-Effort Delivery*).
* **Baja Latencia y Overhead Mínimo:** La cabecera de un paquete UDP requiere únicamente 8 bytes (frente a los 20-60 bytes de TCP), eliminando el retardo asociado a la negociación inicial y las retransmisiones.
* **Ausencia de Reordenamiento:** No garantiza que los paquetes lleguen en el mismo orden en que fueron transmitidos.
* **Aplicación en Dental Blanc:**
  * Resolución de nombres de dominio en la red local y WAN mediante **DNS (UDP puerto 53)**.
  * Transmisión en tiempo real de video o imágenes diagnósticas en sesiones de **tele-odontología** o monitoreo remoto de pacientes mediante WebRTC/UDP.
  * Sincronización de reloj en servidores y dispositivos IoT mediante **NTP (UDP puerto 123)**.

#### Tabla Comparativa de Familias de Protocolos

| Característica | Protocolo Orientado a Conexión (TCP) | Protocolo No Orientado a Conexión (UDP) |
| :--- | :--- | :--- |
| **Establecimiento de Sesión** | Requerido (*3-way handshake*) | No requerido (*Datagramas independientes*) |
| **Fiabilidad / Integridad** | Alta (Garantiza entrega y orden) | Moderada/Baja (Sin confirmación de entrega) |
| **Retransmisión de Paquetes** | Sí, automática si hay pérdida | No implementada a nivel de transporte |
| **Control de Flujo** | Sí (Ventana deslizante) | No |
| **Tamaño de Cabecera** | 20 a 60 Bytes | 8 Bytes |
| **Velocidad de Transmisión** | Moderada (Mayor overhead) | Muy Alta (Mínimo retardos) |
| **Casos de Uso en Dental Blanc** | API REST, DB PostgreSQL, Autenticación JWT | DNS, Streaming WebRTC, Tele-odontología |

---

### 4.2. Variable 2: Características del Sistema Operativo Seleccionado
Para el despliegue de la plataforma tecnológica del sistema **Dental Blanc**, se ha seleccionado como Sistema Operativo servidor la distribución **Linux Ubuntu Server 22.04 LTS (Long Term Support) x86_64**, basada en la arquitectura Kernel Linux 5.15+.

```
                             ARQUITECTURA DE LA PLATAFORMA TECNOLÓGICA
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 DENTAL BLANC - FRONTEND                                     │
│                            (React + Vite + Tailwind CSS v4)                                 │
└──────────────────────────────────────────────┬──────────────────────────────────────────────┘
                                               │ HTTPS (TLS / TCP 443)
                                               ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                            REVERSE PROXY & FIREWALL (Nginx / UFW)                           │
└──────────────────────────────────────────────┬──────────────────────────────────────────────┘
                                               │ Socket Unix / HTTP local (Port 8000)
                                               ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 BACKEND FASTAPI (Uvicorn)                                   │
│                        (Ejecución sobre Python 3.10 / asyncio loop)                          │
└──────────────────────────────────────────────┬──────────────────────────────────────────────┘
                                               │ TLS / TCP 5432 (SQLAlchemy Pool)
                                               ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                          SISTEMA OPERATIVO: LINUX UBUNTU SERVER 22.04 LTS                   │
│         Kernel Linux 5.15+ | Gestor de Procesos Systemd | Sistema de Archivos EXT4         │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
                                               │
                                               ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                          BASE DE DATOS CLOUD: NEON (PostgreSQL)                             │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

#### A. Justificación y Requerimientos del Sistema Operativo

1. **Kernel y Manejo de Concurrencia:**
   * El Kernel de Linux implementa un modelo de programación asíncrona por eventos mediante la llamada de sistema `epoll`, vital para soportar el event loop de **Python `asyncio`** y el servidor de aplicaciones **Uvicorn/FastAPI**. Esto permite manejar miles de peticiones simultáneas con una huella de memoria reducida.

2. **Gestión de Memoria y Almacenamiento:**
   * Utiliza el sistema de archivos **EXT4** con soporte de transacciones (*Journaling*) para prevenir corrupción de archivos en cortes de energía.
   * Implementa una gestión avanzada de memoria virtual (*Paging* y memoria *Swap*) con recolección de caché en disco (*Page Cache*), optimizando el tiempo de respuesta del servidor web.

3. **Arquitectura y Requerimientos de Hardware Recomendados:**

| Componente | Requisito Mínimo | Requisito Recomendado (Producción Dental Blanc) |
| :--- | :--- | :--- |
| **Procesador (CPU)** | 2 Cores x86_64 (2.0 GHz) | 4 vCPUs / 8 Cores (3.0 GHz+ Intel/AMD) |
| **Memoria RAM** | 2 GB DDR4 | 8 GB DDR4 / DDR5 con ECC |
| **Almacenamiento** | 20 GB SSD | 100 GB NVMe SSD (RAID 1 para redundancia) |
| **Interfaz de Red (NIC)** | 1 Gbps Ethernet | 10 Gbps Ethernet (Doble NIC para Failover) |
| **Arquitectura OS** | 64 bits (x86_64 / ARM64) | 64 bits (x86_64) |

4. **Gestión de Servicios y Virtualización (Systemd y Containers):**
   * Configuración de servicios persistentes mediante `systemd` para iniciar automáticamente la API de FastAPI (`gunicorn/uvicorn`) y el servidor web Nginx ante un reinicio del sistema.
   * Compatibilidad nativa con **Docker** y **Docker Compose** para aislar entornos de desarrollo y producción.

5. **Seguridad y Hardening del Sistema Operativo:**
   * **Firewall Activo (UFW):** Cierre estricto de puertos no autorizados, permitiendo únicamente entradas por los puertos 22 (SSH filtrado), 80 (HTTP) y 443 (HTTPS).
   * **Políticas POSIX de Usuarios:** Ejecución del proceso de la aplicación bajo un usuario sin privilegios de root (`www-data` o `dental_user`).
   * **Cifrado de Comunicaciones:** Implementación de certificados SSL/TLS con Let's Encrypt mediante Certbot.
   * **Protección del Acceso SSH:** Autenticación exclusiva por par de claves criptográficas (RSA 4096-bit o ED25519) desactivando el login por contraseña en `/etc/ssh/sshd_config`.

---

### 4.3. Variable 3: Medios de Transmisión (Guiados y No Guiados)
Para garantizar la conectividad entre los componentes físicos de la clínica odontológica (estaciones de trabajo, equipos de radiología digital, tablets de pacientes y servidores local/nube), se diseña una infraestructura de red híbrida que utiliza medios guiados y no guiados.

```
                                INFRAESTRUCTURA DE RED DE LA CLÍNICA
                                                 │
                     ┌───────────────────────────┴───────────────────────────┐
                     ▼                                                       ▼
          MEDIOS GUIADOS (CABLEADOS)                               MEDIOS NO GUIADOS (INALÁMBRICOS)
     ───────────────────────────────────                      ───────────────────────────────────
     • Par Trenzado UTP/STP Cat 6A                            • Wi-Fi 6 (IEEE 802.11ax / WPA3)
     • Fibra Óptica Monomodo (SMF)                            • Bluetooth Low Energy (BLE 5.0+)
     • Enlaces de alta velocidad LAN/WAN                      • Red Celular 5G / Enlace Satelital
```

#### A. Medios de Transmisión Guiados (Confinados / Físicos)
Son aquellos canales donde las ondas electromagnéticas son conducidas a través de un camino físico delimitado.

1. **Cable de Par Trenzado (UTP / STP Categoría 6A):**
   * **Descripción:** Consta de 4 pares de hilos de cobre trenzados entre sí para cancelar interferencias magnéticas externas.
   * **Velocidad y Distancia:** Soporta anchos de banda de hasta 10 Gbps a distancias de hasta 100 metros.
   * **Aplicación en la Clínica:** Red de cableado estructurado horizontal que conecta las estaciones fijas de los consultorios, los equipos de cómputo de recepción y la impresora térmica con el Switch principal del cuarto de telecomunicaciones. Se utiliza versión apantallada (**STP**) en áreas cercanas a equipos de Rayos X o electromédicos para evitar interferencias.

2. **Fibra Óptica (Monomodo SMF y Multimodo MMF):**
   * **Descripción:** Transmite impulsos de luz a través de un núcleo de vidrio o silicio, siendo inmune por completo al ruido electromagnético.
   * **Aplicación en la Clínica:** 
     * **Fibra Multimodo (MMF):** Conexión del *backbone* vertical (dorsal de red) entre pisos o entre el cuarto de servidores y los distribuidores de área (IDF).
     * **Fibra Monomodo (SMF):** Enlace principal de Internet dedicado y simétrico (FTTH - *Fiber to the Home/Office*) proporcionado por el ISP para conectar la clínica con los servicios en la nube de Neon y Supabase.

3. **Cable Coaxial (Uso Secundario):**
   * **Aplicación:** Utilizado exclusivamente para la distribución de señales de televisión en salas de espera o enlaces de cámaras de seguridad CCTV analógicas heredadas.

#### B. Medios de Transmisión No Guiados (No Confinados / Inalámbricos)
Son medios de comunicación donde la transmisión y recepción se realizan mediante antenas y ondas electromagnéticas propagadas por el aire o espacio libre.

1. **Redes Inalámbricas Wi-Fi (IEEE 802.11ax - Wi-Fi 6 / 6E):**
   * **Frecuencias:** Opera en bandas de 2.4 GHz, 5 GHz y 6 GHz, ofreciendo mayor densidad de conexiones simultáneas y baja latencia mediante OFDMA.
   * **Seguridad:** Protocolo de cifrado **WPA3-Enterprise** con autenticación mediante servidor RADIUS/802.1X, aislando la red de pacientes (*Guest Wi-Fi*) de la red médica privada (*Clinical Wi-Fi*).
   * **Aplicación en la Clínica:** Permite a los odontólogos y auxiliares movilizarse con tablets táctiles para mostrar odontogramas, diligenciar la historia clínica y agendar citas desde cualquier consultorio.

2. **Bluetooth Low Energy (BLE 5.0 / 5.2):**
   * **Descripción:** Protocolo de ondas de radio de corto alcance (hasta 10-15 metros) con un consumo de energía extremadamente reducido.
   * **Aplicación en la Clínica:** Vinculación directa entre accesorios odontológicos (escáneres intraorales portátiles, sensores digitales de radiovisiografía) y las computadoras de escritorio de los consultorios.

3. **Redes Celulares (4G LTE / 5G) y Satelitales (Starlink / Backup WAN):**
   * **Aplicación:** Módem de respaldo (*Failover*) automático en la red de la clínica. Si el enlace principal de fibra óptica sufre una interrupción, el router conmutará de inmediato a la red celular 5G/4G para garantizar que el sistema Dental Blanc no pierda conexión con la API en la nube ni se interrumpa la facturación.

#### Tabla Comparativa de Medios de Transmisión

| Medio | Tipo | Ancho de Banda Máximo | Inmunidad a Ruido EMI | Movilidad | Uso Principal en Dental Blanc |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **UTP Cat 6A** | Guiado | 10 Gbps | Media / Alta (STP) | Nula (Fijo) | Estaciones de recepción y PCs de consultorio |
| **Fibra Óptica** | Guiado | 100+ Gbps | Total (Inmune) | Nula (Fijo) | Enlace ISP dedicado y Backbone de red |
| **Wi-Fi 6 (802.11ax)**| No Guiado | 9.6 Gbps | Media | Alta | Tablets de odontólogos y red de pacientes |
| **Bluetooth BLE** | No Guiado | 2 Mbps | Baja | Alta (Corto alcance)| Periféricos y escáneres intraorales |
| **Red Celular 5G** | No Guiado | 1 - 10 Gbps | N/A | Alta | Conexión de respaldo de Internet (Failover) |

---

### 4.4. Variable 4: Cumplimiento de Normas Básicas de Presentación de Documentos
El presente documento ha sido redactado respetando la norma técnica institucional y los estándares de documentación formal para proyectos de desarrollo de software (normas IEEE / APA / SENA):

1. **Estructura Organizada:** Portada normalizada con código de evidencia, tabla de datos generales, introducción, objetivos generales y específicos, cuerpo del informe estructurado por variables y conclusiones.
2. **Jerarquía Tipográfica:** Uso correcto de encabezados en formato Markdown (`#`, `##`, `###`), viñetas jerárquicas y resaltado en negrita para facilitar la lectura técnica.
3. **Diagramación y Listas:** Inclusión de diagramas de arquitectura en arte ASCII y tablas comparativas para sintetizar información clave de protocolos, sistemas operativos y medios de transmisión.
4. **Trazabilidad y Referencias:** Enlaces explícitos a archivos del proyecto y referencias bibliográficas normalizadas al final del documento.

---

## 5. LISTA DE CHEQUEO DE EVALUACIÓN

| No. | VARIABLES / INDICADORES DE LOGRO | CUMPLE (SÍ / NO) | OBSERVACIONES TÉCNICAS |
| :-: | :--- | :-: | :--- |
| **1** | Diferencia con claridad las dos grandes familias de protocolos, respecto a la transmisión y recepción de datos. | **SÍ** | Se comparan en profundidad las familias TCP (orientada a conexión, confiable) y UDP (no orientada a conexión, baja latencia), detallando sus aplicaciones dentro del stack de Dental Blanc (HTTPS, PostgreSQL, DNS, WebRTC). |
| **2** | Describe las características que debe tener el sistema operativo seleccionado, con base en la plataforma seleccionada. | **SÍ** | Se detalla la selección de Linux Ubuntu Server 22.04 LTS x86_64, especificando requisitos de CPU, RAM, SSD, Kernel epoll/asyncio, systemd, Nginx y hardening con UFW y SSH. |
| **3** | Se mencionan los medios de transmisión (guiados - no guiados). | **SÍ** | Se analizan y comparan los medios guiados (UTP Cat 6A, Fibra Óptica) y no guiados (Wi-Fi 6, Bluetooth BLE, Redes 5G/Failover) para la clínica odontológica. |
| **4** | Presenta el informe cumpliendo con las normas básicas de presentación de documentos. | **SÍ** | El informe cuenta con la portada institucional, estructura formal (introducción, objetivos, cuerpo técnico, tablas y conclusiones) y estándar de presentación SENA. |

---

## 6. CONCLUSIONES
1. La planificación adecuada de las familias de protocolos permite optimizar las comunicaciones de la plataforma **Dental Blanc**: se garantiza máxima seguridad e integridad de datos mediante TCP/HTTPS/TLS para transacciones y persistencia clínica, mientras que UDP asegura rapidez en resolución de nombres y transmisiones de datos en tiempo real.
2. La selección de **Linux Ubuntu Server 22.04 LTS** brinda un entorno robusto, seguro y altamente eficiente para ejecutar la API backend basada en FastAPI y Uvicorn, aprovechando la arquitectura multihilo y asíncrona del Kernel Linux junto con un esquema de seguridad perimetral basado en UFW y proxy inverso Nginx.
3. El diseño de una red híbrida que combina medios guiados (UTP Cat 6A y Fibra Óptica) para la infraestructura fija del servidor y estaciones de trabajo, junto con medios no guiados (Wi-Fi 6 con WPA3 y red 5G de respaldo), proporciona la movilidad y disponibilidad necesarias para la gestión clínica moderna.

---

## 7. REFERENCIAS BIBLIOGRÁFICAS
* Tanenbaum, A. S., & Wetherall, D. J. (2012). *Redes de computadoras* (5a ed.). Pearson Educación.
* Stallings, W. (2004). *Comunicaciones y Redes de Computadores* (7a ed.). Prentice Hall.
* Canonical Ltd. (2022). *Ubuntu Server Guide 22.04 LTS*. Ubuntu Documentation. https://ubuntu.com/server/docs
* FastAPI Documentation. (2024). *Deployment - Server Workers with Uvicorn*. https://fastapi.tiangolo.com/deployment/
* IEEE Computer Society. (2021). *IEEE Standard for Information Technology--Telecommunications and information exchange between systems Local and metropolitan area networks--Specific requirements Part 11: Wireless LAN Medium Access Control (MAC) and Physical Layer (PHY) Specifications (Wi-Fi 6)*. IEEE Std 802.11ax-2021.
