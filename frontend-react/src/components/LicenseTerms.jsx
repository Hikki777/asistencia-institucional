import React from 'react';
import { FileText, Shield, Users, Database, Lock } from 'lucide-react';

export default function LicenseTerms() {
  return (
    <div className="space-y-4 text-sm text-gray-700 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
          <FileText size={18} />
          Licencia de Uso del Sistema
        </h3>
        <p className="text-blue-800 text-xs">
          Versión 1.0 - Sistema de Registro Institucional
        </p>
      </div>

      <div className="space-y-3">
        <section>
          <h4 className="font-semibold text-gray-800 flex items-center gap-2 mb-2">
            <Shield size={16} className="text-green-600" />
            1. Uso Permitido
          </h4>
          <p className="text-xs leading-relaxed">
            Este sistema está diseñado exclusivamente para la gestión de asistencias en instituciones educativas. 
            El uso del software implica la aceptación de estos términos y condiciones.
          </p>
        </section>

        <section>
          <h4 className="font-semibold text-gray-800 flex items-center gap-2 mb-2">
            <Database size={16} className="text-blue-600" />
            2. Protección de Datos
          </h4>
          <ul className="text-xs space-y-1 list-disc list-inside">
            <li>Los datos personales serán tratados con confidencialidad</li>
            <li>Se implementan medidas de seguridad para proteger la información</li>
            <li>Los datos no serán compartidos con terceros sin consentimiento</li>
            <li>Cumplimiento con regulaciones de protección de datos aplicables</li>
          </ul>
        </section>

        <section>
          <h4 className="font-semibold text-gray-800 flex items-center gap-2 mb-2">
            <Users size={16} className="text-purple-600" />
            3. Responsabilidades del Usuario
          </h4>
          <ul className="text-xs space-y-1 list-disc list-inside">
            <li>Mantener la confidencialidad de las credenciales de acceso</li>
            <li>Usar el sistema de manera ética y responsable</li>
            <li>No intentar acceder a áreas no autorizadas del sistema</li>
            <li>Reportar cualquier vulnerabilidad o problema de seguridad</li>
          </ul>
        </section>

        <section>
          <h4 className="font-semibold text-gray-800 flex items-center gap-2 mb-2">
            <Lock size={16} className="text-red-600" />
            4. Limitaciones
          </h4>
          <ul className="text-xs space-y-1 list-disc list-inside">
            <li>El software se proporciona "tal cual" sin garantías explícitas</li>
            <li>No nos hacemos responsables por pérdida de datos debido a uso inadecuado</li>
            <li>Se recomienda realizar respaldos periódicos de la información</li>
            <li>El soporte técnico está sujeto a disponibilidad</li>
          </ul>
        </section>

        <section>
          <h4 className="font-semibold text-gray-800 mb-2">
            5. Modificaciones
          </h4>
          <p className="text-xs leading-relaxed">
            Nos reservamos el derecho de modificar estos términos en cualquier momento. 
            Los cambios significativos serán notificados a los usuarios.
          </p>
        </section>

        <section>
          <h4 className="font-semibold text-gray-800 mb-2">
            6. Aceptación
          </h4>
          <p className="text-xs leading-relaxed">
            Al marcar la casilla de aceptación y completar el setup, usted acepta estos términos 
            y condiciones en su totalidad.
          </p>
        </section>
      </div>

      <div className="bg-gray-50 p-3 rounded border border-gray-200 mt-4">
        <p className="text-xs text-gray-600 italic">
          Para cualquier consulta sobre estos términos, contacte al administrador del sistema.
        </p>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  );
}
