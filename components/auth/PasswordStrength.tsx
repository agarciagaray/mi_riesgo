import React from 'react';

interface PasswordStrengthProps {
    password?: string;
}

interface Requirement {
    id: string;
    regex: RegExp;
    label: string;
}

const requirements: Requirement[] = [
    { id: 'length', regex: /.{8,}/, label: 'Al menos 8 caracteres' },
    { id: 'lowercase', regex: /[a-z]/, label: 'Una letra minúscula' },
    { id: 'uppercase', regex: /[A-Z]/, label: 'Una letra mayúscula' },
    { id: 'number', regex: /[0-9]/, label: 'Al menos un número' },
    { id: 'symbol', regex: /[!@#$%^&*(),.?":{}|<>]/, label: 'Un símbolo especial' },
];

const CheckmarkIcon = ({ className }: { className: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
);

const RequirementItem: React.FC<{ label: string, met: boolean }> = ({ label, met }) => {
    const textColor = met ? 'text-green-400' : 'text-gray-400';
    const iconColor = met ? 'text-green-500' : 'text-gray-500';

    return (
        <li className={`flex items-center text-xs transition-colors duration-300 ${textColor}`}>
            <CheckmarkIcon className={`h-3 w-3 mr-2 ${iconColor}`} />
            {label}
        </li>
    );
};

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password = '' }) => {
    const fulfilledRequirements = requirements.map(req => ({
        ...req,
        met: req.regex.test(password),
    }));

    // No renderizar nada si la contraseña está vacía.
    if (!password) {
        return null;
    }

    return (
        <div className="bg-gray-700/50 p-3 rounded-md">
            <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
                {fulfilledRequirements.map(req => (
                    <RequirementItem key={req.id} label={req.label} met={req.met} />
                ))}
            </ul>
        </div>
    );
};
