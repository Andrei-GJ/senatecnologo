# INFORME TÉCNICO: CONCEPTOS Y PRINCIPIOS ACERCA DE CONFIGURACIÓN DE SERVICIOS Y CLUSTERIZACIÓN (DENTAL BLANC)

**CÓDIGO DE EVIDENCIA:** GA10-220501097-AA4-EV01  
**PROGRAMA DE FORMACIÓN:** Análisis y Desarrollo de Software (ADSO)  
**PROYECTO FORMATIVO:** Construcción de software integrador de tecnologías orientadas a servicios  
**FASE DEL PROYECTO:** Ejecución  
**RESULTADO DE APRENDIZAJE:** 220501097-02 - Desplegar el software de acuerdo con la arquitectura y las políticas establecidas.  
**ACTIVIDAD DE APRENDIZAJE:** GA10-220501097-AA4 - Configurar los servicios requeridos, de acuerdo con la arquitectura.  
**EVIDENCIA DE CONOCIMIENTO:** Conceptos y principios acerca de configuración de servicios (GA10-220501097-AA4-EV01).  

---

## 1. DATOS GENERALES
* **Nombre del Proyecto:** Dental Blanc - Sistema Clínico Odontológico (Fullstack)
* **Aprendiz:** Andrei Santiago Sotelo Gómez (ADSO)
* **Centro de Formación:** Servicio Nacional de Aprendizaje (SENA)
* **Stack Tecnológico:** Python (FastAPI / Uvicorn), PostgreSQL (Cluster/Neon/Render), Docker/Kubernetes, Linux.

---

## 2. INTRODUCCIÓN
En el desarrollo e implantación de soluciones de software empresarial, garantizar la continuidad del servicio, la tolerancia a fallos y la capacidad de atender demandas concurrentes crecientes es un imperativo arquitectónico. Las arquitecturas monolíticas desplegadas en servidores únicos introducen un Punto Único de Fallo (*Single Point of Failure* - SPOF) y limitan su crecimiento al escalamiento vertical de hardware.

La tecnología de clusterización resuelve este desafío interconectando múltiples nodos independientes que operan de manera coordinada para comportarse como un único sistema robusto. El presente informe aborda los conceptos y principios de configuración de servicios en clúster, clasificando los tipos de clústeres, analizando sus características y debilidades, evaluando las herramientas líderes de la industria y definiendo políticas de copias de respaldo para la protección de datos.

---

## 3. OBJETIVOS

### 3.1 Objetivo General
Comprender y estructurar los principios de configuración de servicios y clusterización aplicables a sistemas de software distribuidos, asegurando alta disponibilidad, escalabilidad y seguridad operativa.

### 3.2 Objetivos Específicos
1. Diferenciar con claridad los tipos de clústeres (Alta Disponibilidad, Balanceo de Carga, Alto Rendimiento y Procesamiento Distribuido) y el tipo de procesamiento que ejecutan.
2. Describir las características estructurales, ventajas y desventajas inherentes a las tecnologías de clusterización.
3. Seleccionar y caracterizar herramientas líderes para la gestión y orquestación de clústeres (Kubernetes, Docker Swarm, Pacemaker/Corosync y Slurm).
4. Definir un esquema de políticas y copias de respaldo (*backups*) alineado con los criterios de evaluación del resultado de aprendizaje.

---

## 4. TIPOS DE CLÚSTERES Y MODELOS DE PROCESAMIENTO

Los clústeres se clasifican según el requerimiento no funcional que optimizan:

### 4.1 Clústeres de Alta Disponibilidad (*High Availability* - HA)
* **Propósito:** Garantizar la continuidad operativa y erradicar tiempos de inactividad no planificados (*downtime*), alcanzando SLAs del 99.9% o superiores.
* **Mecanismo:** Intercambio continuo de latidos (*heartbeats*). Ante la caída del nodo activo, se transfiere automáticamente la dirección IP virtual (VIP) y los servicios al nodo en reserva (*failover*).
* **Tipo de Procesamiento:** Procesamiento Transaccional Continuo (OLTP), crítico para motores de bases de datos relacionales (PostgreSQL, MySQL).

### 4.2 Clústeres de Balanceo de Carga (*Load Balancing*)
* **Propósito:** Distribuir el volumen de tráfico entrante entre múltiples nodos de cómputo para evitar la saturación de un servidor particular.
* **Mecanismo:** Un balanceador frontal (Capa 4 o Capa 7) enruta peticiones utilizando algoritmos como Round Robin, Menor Número de Conexiones o IP Hashing.
* **Tipo de Procesamiento:** Procesamiento Concurrente sin Estado (*Stateless*), ideal para APIs REST, microservicios web y frontends.

### 4.3 Clústeres de Alto Rendimiento (*High Performance Computing* - HPC)
* **Propósito:** Resolver tareas computacionales intensivas en el menor tiempo posible mediante paralelización masiva.
* **Mecanismo:** Uso de redes de interconexión de latencia ultra baja (InfiniBand) y protocolos de paso de mensajes (MPI) para dividir cálculos complejos entre miles de núcleos.
* **Tipo de Procesamiento:** Cómputo Paralelo Masivo: Simulaciones científicas, dinámica molecular y entrenamiento de modelos de Machine Learning.

### 4.4 Clústeres de Procesamiento Distribuido (*Big Data / Grid*)
* **Propósito:** Almacenar y procesar volúmenes masivos de datos (Terabytes/Petabytes) aplicando el principio de localidad del dato (*Data Locality*).
* **Mecanismo:** Particionado y procesamiento en paralelo mediante paradigmas como MapReduce o grafos acíclicos dirigidos (DAG en memoria).
* **Tipo de Procesamiento:** Procesamiento por Lotes (*Batch*) y en Tiempo Real (*Streaming*) sobre grandes repositorios analíticos.

### 4.5 Cuadro Comparativo de Tipos de Clústeres

| Tipo de Clúster | Métrica Crítica | Tolerancia a Fallos | Cuello de Botella Típico | Caso de Uso Principal |
| :--- | :--- | :--- | :--- | :--- |
| **Alta Disponibilidad (HA)** | Uptime y MTTR | Crítica (conmutación automática) | Detección de fallos y Quórum | Bases de datos, Pasarelas de pago |
| **Balanceo de Carga** | Throughput (RPS) y Latencia | Alta en nodos de aplicación | Capacidad de red del balanceador | APIs REST, Portales web corporativos |
| **Alto Rendimiento (HPC)** | Operaciones/seg (FLOPS) | Media (respaldada en checkpoints) | Latencia entre nodos (IPC/Red) | Simulaciones científicas, IA profunda |
| **Procesamiento Distribuido** | Tasa de transferencia I/O | Alta (re-ejecuta tareas fallidas) | I/O en disco y ancho de banda | Analítica de Big Data (Spark, Hadoop) |

---

## 5. CARACTERÍSTICAS, VENTAJAS Y DESVENTAJAS DE LAS TECNOLOGÍAS DE CLUSTERIZACIÓN

### 5.1 Características Principales
* **Visión de Sistema Único (*Single System Image* - SSI):** El clúster oculta la complejidad interna, presentándose ante los clientes y usuarios como un único servidor unificado.
* **Escalabilidad Horizontal (*Scale-Out*):** Capacidad de incrementar la potencia global agregando nodos estándar adicionales a la red de forma modular.
* **Consenso Distribuido:** Implementación de algoritmos de quórum (Raft, Paxos) para mantener la coherencia del estado del clúster y la elección de nodos líderes.

### 5.2 Ventajas
* **Continuidad del Negocio:** La indisponibilidad física de un nodo no suspende la operación de la plataforma de software.
* **Eficiencia en Costos:** Aprovechamiento de hardware comercial genérico (*commodity hardware*) en lugar de costosos mainframes especializados.
* **Mantenimiento sin Caída del Sistema (*Zero-Downtime*):** Permite aislar y drenar nodos para aplicar actualizaciones de software o parches de sistema operativo (*Rolling Updates*) sin desconectar usuarios.

### 5.3 Desventajas y Riesgos Operativos
* **Complejidad de Administración:** Requiere competencias avanzadas en redes virtuales superpuestas (*overlay networks*), almacenamiento compartido y sincronización temporal (NTP).
* **Riesgo de Cerebro Dividido (*Split-Brain*):** Ante un fallo de red que divide el clúster en dos segmentos aislados, ambos pueden creerse líderes y escribir datos de forma concurrente, provocando corrupción de datos irrecuperable si no se cuenta con mecanismos de Quórum y STONITH.
* **Latencia de Red Adicional:** El paso de mensajes internodal y la sincronización de estado introduce una sobrecarga temporal en comparación con la memoria compartida de un único servidor.

---

## 6. SELECCIÓN Y DESCRIPCIÓN DE HERRAMIENTAS DE CLÚSTERES

* **1. Kubernetes (K8s):** Orquestador de contenedores de nivel empresarial. Gestiona el ciclo de vida, balanceo de carga interno, escalado automático horizontal (HPA) y autorreparación de aplicaciones en microservicios a través de su plano de control (Control Plane con `etcd`).
* **2. Docker Swarm:** Orquestador nativo integrado en el motor de Docker. Ofrece despliegues distribuidos ligeros mediante una red de enrutamiento superpuesta (Routing Mesh), ideal para proyectos medianos con menor complejidad operativa.
* **3. Pacemaker + Corosync:** Pila de alta disponibilidad para sistemas operativos Linux en infraestructura bare-metal o máquinas virtuales. Corosync maneja la mensajería y quórum, mientras Pacemaker administra recursos y activa el aislamiento STONITH para prevenir split-brain.
* **4. Slurm Workload Manager:** Planificador de colas y gestor de clústeres para entornos HPC. Asigna recursos de cómputo (CPUs y GPUs) a trabajos por lotes para maximizar la utilización del hardware en tareas científicas.

### Cuadro Comparativo de Herramientas

| Herramienta | Capa de Operación | Curva de Aprendizaje | Tolerancia a Fallos | Consumo Base de Recursos |
| :--- | :--- | :--- | :--- | :--- |
| **Kubernetes** | Contenedores / Aplicación | Alta | Muy alta (*self-healing*) | Moderado / Alto |
| **Docker Swarm** | Contenedores / Aplicación | Baja | Alta | Muy bajo |
| **Pacemaker + Corosync** | Infraestructura / S.O. | Media / Alta | Extrema (con Fencing) | Mínimo |
| **Slurm** | Hardware y Procesos HPC | Media | Media (basada en colas) | Bajo |

---

## 7. POLÍTICAS Y ESTRATEGIAS DE COPIAS DE RESPALDO (BACKUPS) EN SERVICIOS

La alta disponibilidad protege contra fallos de hardware, pero no previene la corrupción lógica de datos ni los errores humanos. Por tanto, se establece el siguiente plan de respaldo para servicios en clúster:
* **Regla de Respaldo 3-2-1:** Conservar al menos 3 copias de la información crítica (producción + 2 copias de seguridad), en 2 medios de almacenamiento diferentes (volúmenes locales y almacenamiento de objetos), y 1 copia fuera de sitio (*off-site* en una región cloud separada).
* **Niveles de Respaldo:** Ejecución de respaldos completos (*Full*) semanales, respaldos diferenciales o incrementales diarios, y archivado continuo de registros de transacciones (*Write-Ahead Logging* - WAL en PostgreSQL) para permitir Recuperación Punto en el Tiempo (*Point-In-Time Recovery* - PITR).
* **Automatización y Validación:** Programación desatendida mediante CronJobs o agentes gestionados, y realización de simulacros trimestrales de restauración para certificar el cumplimiento de los objetivos de tiempo de recuperación (RTO) y punto de recuperación (RPO).

---

## 8. CONCLUSIONES
1. La clusterización es una disciplina fundamental para eliminar puntos únicos de fallo y sustentar la escalabilidad horizontal en arquitecturas orientadas a servicios.
2. La selección del tipo de clúster debe responder a la naturaleza de la carga: balanceo de carga para servicios stateless desacoplados y clústeres de alta disponibilidad (HA) con quórum estricto para componentes con estado como bases de datos.
3. Herramientas modernas como Kubernetes han estandarizado la orquestación distribuida, reduciendo los riesgos operacionales mediante la automatización del autoescalado y la autorreparación de servicios.
4. Ninguna arquitectura de clúster está completa sin una política formal de respaldos 3-2-1 que garantice la recuperabilidad de los datos ante eventos catastróficos.

---

## 9. REFERENCIAS BIBLIOGRÁFICAS
* Burns, B., Grant, B., Oppenheimer, D., Brewer, E., & Wilkes, J. (2016). *Borg, Omega, and Kubernetes*. ACM Queue, 14(1), 70-93.
* Coulouris, G., Dollimore, J., Kindberg, T., & Blair, G. (2012). *Distributed Systems: Concepts and Design* (5th ed.). Addison-Wesley.
* Kleppmann, M. (2017). *Designing Data-Intensive Applications: The Big Ideas Behind Reliable, Scalable, and Maintainable Systems*. O'Reilly Media.
* Kubernetes Documentation. (2024). *Kubernetes Architecture and Core Concepts*. Recuperado de https://kubernetes.io/docs/concepts/
* Tanenbaum, A. S., & Van Steen, M. (2017). *Distributed Systems: Principles and Paradigms* (3rd ed.). CreateSpace Independent Publishing.
