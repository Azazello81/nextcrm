interface Props {
  params: {
    method: string;
  };
}

const methodNames: Record<string, string> = {
  email: "через Email",
  phone: "через SMS",
  vk: "через VK ID",
  yandex: "через Яндекс ID",
  telegram: "через Telegram",
};

export default function AuthMethodDisabled({ params }: Props) {
  const readable = methodNames[params.method] ?? "данным способом";

  return (
    <div className="max-w-xl mx-auto py-20 text-center">
      <h1 className="text-3xl font-bold mb-4">Способ недоступен</h1>

      <p className="text-gray-600 text-lg">
        Авторизация {readable} временно отключена.
      </p>
    </div>
  );
}
