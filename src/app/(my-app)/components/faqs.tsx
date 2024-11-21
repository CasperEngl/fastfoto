import Image from "next/image";
import { Container } from "~/app/(my-app)/components/container";

const faqs = [
  [
    {
      question: "How do I share galleries with my clients?",
      answer:
        "Simply create an album, upload your photos, and invite clients via email. They'll receive secure access to view, favorite, and download their photos based on your settings.",
    },
    {
      question: "What file formats are supported?",
      answer:
        "We support all major image formats including JPG, PNG, HEIF, and RAW files. Photos are automatically optimized for web viewing while maintaining original quality for downloads.",
    },
    {
      question: "Is there a limit on storage?",
      answer:
        "Our Professional plan includes unlimited photo storage. The Starter plan includes 100GB, which typically handles 10-15 full wedding galleries or 30-40 portrait sessions.",
    },
  ],
  [
    {
      question: "How do clients select their favorite photos?",
      answer:
        "Clients can easily heart their favorites, create collections, and leave comments. You'll be notified when they've made their selections, streamlining the delivery process.",
    },
    {
      question: "Can I customize the gallery appearance?",
      answer:
        "Yes! Customize colors, layouts, and branding to match your photography style. Add your logo, custom domain, and welcome message to create a cohesive client experience.",
    },
    {
      question: "What about download permissions and print rights?",
      answer:
        "You have full control over download settings. Set expiration dates, limit downloads, add watermarks, and include print release documents automatically with downloads.",
    },
  ],
  [
    {
      question: "How secure are my photos?",
      answer:
        "We use bank-level encryption for storage and transfer. Private galleries are protected with unique access links, and you can enable additional security like download pins and watermarking.",
    },
    {
      question: "Can I integrate with my existing workflow?",
      answer:
        "Yes! We integrate with popular editing software like Lightroom and Capture One. Auto-upload plugins and our API make it easy to fit Fast Foto into your existing workflow.",
    },
    {
      question: "What if I need help getting started?",
      answer:
        "Our support team is here to help! We offer live chat support, detailed tutorials, and free onboarding calls for professional accounts to ensure you're set up for success.",
    },
  ],
];

export function Faqs() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="relative overflow-hidden bg-slate-50 py-20 sm:py-32"
    >
      <Image
        className="absolute left-1/2 top-0 max-w-none -translate-y-1/4 translate-x-[-30%]"
        src="/images/background-faqs.jpg"
        alt=""
        width={1558}
        height={946}
        unoptimized
      />
      <Container className="relative">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2
            id="faq-title"
            className="font-display text-3xl tracking-tight text-slate-900 sm:text-4xl"
          >
            Frequently asked questions
          </h2>
          <p className="mt-4 text-lg tracking-tight text-slate-700">
            If you can’t find what you’re looking for, email our support team
            and if you’re lucky someone will get back to you.
          </p>
        </div>
        <ul className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
          {faqs.map((column, columnIndex) => (
            <li key={columnIndex}>
              <ul className="flex flex-col gap-y-8">
                {column.map((faq, faqIndex) => (
                  <li key={faqIndex}>
                    <h3 className="font-display text-lg leading-7 text-slate-900">
                      {faq.question}
                    </h3>
                    <p className="mt-4 text-sm text-slate-700">{faq.answer}</p>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
