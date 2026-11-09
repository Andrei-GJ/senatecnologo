# =========================================================================
# SERVICIO DE GENERACIÓN DE COMPROBANTES PDF (pdf_service.py)
# =========================================================================
# Genera comprobantes oficiales de citas clínicas con ReportLab.
# Sigue los estándares de Clean Code y buenas prácticas visuales.

from io import BytesIO
import datetime

try:
    from reportlab.lib.pagesizes import letter
    from reportlab.platypus import (
        SimpleDocTemplate,
        Paragraph,
        Spacer,
        Table,
        TableStyle,
        HRFlowable,
        KeepTogether,
    )
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib import colors
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False


STATUS_LABELS = {
    "pending": "Pendiente de Confirmación",
    "confirmed": "Confirmada",
    "completed": "Atendida / Completada",
    "cancelled": "Cancelada",
}


def formatear_precio_cop(precio: float | None) -> str:
    """Formatea valores monetarios en pesos colombianos (COP)."""
    if precio is None:
        return "$0 COP"
    return f"${precio:,.0f} COP".replace(",", ".")


def generate_appointment_pdf(order) -> bytes:
    """Genera el contenido binario del comprobante PDF de una cita clínica."""
    if not REPORTLAB_AVAILABLE:
        # Fallback de respaldo si el entorno de ejecución no tiene reportlab instalado
        plain_content = (
            f"DENTAL BLANC - COMPROBANTE CLINICO OFICIAL\n"
            f"Folio Turno: #{order.id}\n"
            f"Paciente: {order.client.full_name if order.client else 'Paciente'}\n"
            f"Documento/Cedula: {order.client.cedula if order.client and order.client.cedula else 'No registrado'}\n"
            f"Tratamiento: {order.service.name if order.service else 'General'}\n"
            f"Fecha: {order.date} - Hora: {order.time}\n"
            f"Odontologo: {order.dentist.full_name if order.dentist else 'Asignado en recepcion'}\n"
            f"Tarifa: {formatear_precio_cop(order.service.price if order.service else 0)}\n"
            f"Estado: {STATUS_LABELS.get(order.status, order.status)}\n"
        )
        return plain_content.encode("utf-8")

    buffer = BytesIO()

    # Configuración del documento en tamaño carta con márgenes de 36pt (0.5 in)
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36,
    )

    styles = getSampleStyleSheet()

    # Paleta de colores institucionales de Dental Blanc
    c_primary = colors.HexColor("#0284C7")      # Sky 600
    c_primary_dark = colors.HexColor("#0369A1") # Sky 700
    c_slate_dark = colors.HexColor("#0F172A")   # Slate 900
    c_slate_body = colors.HexColor("#334155")   # Slate 700
    c_slate_light = colors.HexColor("#64748B")  # Slate 500
    c_bg_subtle = colors.HexColor("#F8FAFC")    # Slate 50
    c_border = colors.HexColor("#E2E8F0")       # Slate 200

    # Estilos tipográficos
    brand_style = ParagraphStyle(
        "BrandTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        textColor=c_primary_dark,
    )

    brand_sub = ParagraphStyle(
        "BrandSub",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13,
        textColor=c_slate_light,
    )

    doc_meta_style = ParagraphStyle(
        "DocMeta",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8,
        leading=12,
        alignment=2,  # Alineación a la derecha
        textColor=c_slate_body,
    )

    section_heading = ParagraphStyle(
        "SectionHeading",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=11,
        leading=15,
        textColor=c_primary_dark,
    )

    cell_label = ParagraphStyle(
        "CellLabel",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=9,
        leading=12,
        textColor=c_slate_dark,
    )

    cell_value = ParagraphStyle(
        "CellValue",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=12,
        textColor=c_slate_body,
    )

    recommendation_item = ParagraphStyle(
        "RecItem",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=12.5,
        textColor=c_slate_body,
    )

    footer_style = ParagraphStyle(
        "FooterNote",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=7.5,
        leading=11,
        alignment=1,  # Centrado
        textColor=c_slate_light,
    )

    story = []

    # 1. ENCABEZADO INSTITUCIONAL
    fecha_emision = datetime.datetime.now().strftime("%d/%m/%Y %H:%M")
    folio = f"DB-{order.id:06d}"

    header_left = (
        f"<b>DENTAL BLANC</b><br/>"
        f"<font size='10' color='#0284C7'><b>Clínica Odontológica Especializada</b></font><br/>"
        f"<font size='7.5' color='#64748B'>NIT: 901.458.789-2 &bull; Habilitación Seccional de Salud No. 11001-09823</font>"
    )

    header_right = (
        f"<font size='11' color='#0369A1'><b>COMPROBANTE OFICIAL DE CITA</b></font><br/>"
        f"<b>Folio / Turno:</b> <font color='#0284C7'><b>#{folio}</b></font><br/>"
        f"<b>Fecha de Emisión:</b> {fecha_emision}"
    )

    header_table = Table(
        [
            [
                Paragraph(header_left, brand_style),
                Paragraph(header_right, doc_meta_style),
            ]
        ],
        colWidths=[330, 210],
    )
    header_table.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )
    story.append(header_table)
    story.append(
        HRFlowable(
            width="100%",
            thickness=1.5,
            color=c_primary,
            spaceBefore=4,
            spaceAfter=12,
        )
    )

    # 2. DATOS DEL PACIENTE
    story.append(Paragraph("DATOS DEL PACIENTE", section_heading))
    story.append(Spacer(1, 4))

    paciente_nombre = order.client.full_name if order.client else "No registrado"
    paciente_correo = order.client.email if order.client else "No registrado"
    paciente_cedula = (
        order.client.cedula
        if (order.client and order.client.cedula)
        else "No registrada"
    )

    datos_paciente = [
        [
            Paragraph("Nombre Completo:", cell_label),
            Paragraph(paciente_nombre, cell_value),
            Paragraph("Documento / Cédula:", cell_label),
            Paragraph(paciente_cedula, cell_value),
        ],
        [
            Paragraph("Correo Electrónico:", cell_label),
            Paragraph(paciente_correo, cell_value),
            Paragraph("ID Paciente:", cell_label),
            Paragraph(f"PAC-{order.client_id:04d}", cell_value),
        ],
    ]

    tabla_paciente = Table(datos_paciente, colWidths=[120, 150, 130, 140])
    tabla_paciente.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), c_bg_subtle),
                ("BOX", (0, 0), (-1, -1), 0.5, c_border),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, c_border),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    story.append(tabla_paciente)
    story.append(Spacer(1, 12))

    # 3. DETALLES DE LA CITA MÉDICA
    story.append(Paragraph("DETALLES DE LA CITA MÉDICA", section_heading))
    story.append(Spacer(1, 4))

    servicio_nombre = order.service.name if order.service else "Consulta General"
    servicio_precio = formatear_precio_cop(
        order.service.price if order.service else 0.0
    )
    fecha_cita = order.date.strftime("%d/%m/%Y") if order.date else "Por definir"
    hora_cita = (
        order.time.strftime("%I:%M %p") if order.time else "Por definir"
    )
    estado_texto = STATUS_LABELS.get(order.status, order.status.capitalize())

    datos_cita = [
        [
            Paragraph("Servicio / Tratamiento:", cell_label),
            Paragraph(f"<b>{servicio_nombre}</b>", cell_value),
            Paragraph("Valor Estimado:", cell_label),
            Paragraph(f"<b>{servicio_precio}</b>", cell_value),
        ],
        [
            Paragraph("Fecha de Consulta:", cell_label),
            Paragraph(fecha_cita, cell_value),
            Paragraph("Hora Programada:", cell_label),
            Paragraph(hora_cita, cell_value),
        ],
        [
            Paragraph("Estado de la Cita:", cell_label),
            Paragraph(
                f"<font color='#0284C7'><b>{estado_texto}</b></font>", cell_value
            ),
            Paragraph("Modalidad:", cell_label),
            Paragraph("Presencial - Sede Principal", cell_value),
        ],
    ]

    tabla_cita = Table(datos_cita, colWidths=[130, 140, 130, 140])
    tabla_cita.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), c_bg_subtle),
                ("BOX", (0, 0), (-1, -1), 0.5, c_border),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, c_border),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    story.append(tabla_cita)
    story.append(Spacer(1, 12))

    # 4. PROFESIONAL TRATANTE ASIGNADO
    story.append(Paragraph("PROFESIONAL TRATANTE ASIGNADO", section_heading))
    story.append(Spacer(1, 4))

    if order.dentist:
        profesional_nombre = f"Dr(a). {order.dentist.full_name}"
        profesional_correo = order.dentist.email
    else:
        profesional_nombre = "Por asignar"
        profesional_correo = "Recepción asignará al especialista disponible"

    datos_profesional = [
        [
            Paragraph("Odontólogo Responsable:", cell_label),
            Paragraph(f"<b>{profesional_nombre}</b>", cell_value),
            Paragraph("Contacto Profesional:", cell_label),
            Paragraph(profesional_correo, cell_value),
        ]
    ]

    tabla_profesional = Table(datos_profesional, colWidths=[140, 130, 130, 140])
    tabla_profesional.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), c_bg_subtle),
                ("BOX", (0, 0), (-1, -1), 0.5, c_border),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, c_border),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    story.append(tabla_profesional)
    story.append(Spacer(1, 14))

    # 5. RECOMENDACIONES PREVIAS A LA CONSULTA MÉDICA
    recomendaciones = [
        [
            Paragraph(
                "<b>1. Presentación anticipada:</b> Llegar a la sede de la clínica 10 a 15 minutos antes de la hora acordada para el proceso de ingreso en recepción.",
                recommendation_item,
            )
        ],
        [
            Paragraph(
                "<b>2. Documento de identidad:</b> Presentar documento de identidad original físico (Cédula de Ciudadanía, Tarjeta de Identidad o Cédula de Extranjería).",
                recommendation_item,
            )
        ],
        [
            Paragraph(
                "<b>3. Higiene oral:</b> Realizar un cepillado dental adecuado antes de acudir a la consulta médica odontológica.",
                recommendation_item,
            )
        ],
        [
            Paragraph(
                "<b>4. Exámenes e historial:</b> Si cuenta con radiografías panorámicas o periapicales recientes o historia clínica externa, presentarlas al odontólogo tratante.",
                recommendation_item,
            )
        ],
        [
            Paragraph(
                "<b>5. Política de cancelación:</b> Si no puede asistir, recuerde cancelar o reprogramar su cita con un mínimo de 24 horas de antelación para liberar el turno clínico.",
                recommendation_item,
            )
        ],
    ]

    tabla_recomendaciones = Table(recomendaciones, colWidths=[540])
    tabla_recomendaciones.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F0F9FF")),  # Sky 50
                ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#BAE6FD")),    # Sky 200
                ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E0F2FE")),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
            ]
        )
    )

    bloque_recomendaciones = KeepTogether(
        [
            Paragraph("RECOMENDACIONES PREVIAS A LA CONSULTA", section_heading),
            Spacer(1, 4),
            tabla_recomendaciones,
        ]
    )
    story.append(bloque_recomendaciones)
    story.append(Spacer(1, 18))

    # 6. PIE DE PÁGINA INSTITUCIONAL
    story.append(
        HRFlowable(
            width="100%",
            thickness=0.5,
            color=c_border,
            spaceBefore=0,
            spaceAfter=8,
        )
    )
    nota_pie = (
        "<b>Dental Blanc &bull; Especialistas en Salud y Estética Oral</b><br/>"
        "Sede Principal: Carrera 15 # 85-30, Bogotá D.C., Colombia &bull; PBX: (601) 745-0000 &bull; WhatsApp: +57 310 999 0000<br/>"
        "Portal de Pacientes: www.dentalblanc.com &bull; Comprobante digital verificado por el sistema asistencial de turnos"
    )
    story.append(Paragraph(nota_pie, footer_style))

    doc.build(story)
    return buffer.getvalue()
