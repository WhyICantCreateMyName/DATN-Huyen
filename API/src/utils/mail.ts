import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.MAIL_PORT) || 587,
  secure: process.env.MAIL_SECURE === 'true',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export const sendResetPasswordEmail = async (email: string, resetLink: string) => {
  const mailOptions = {
    from: `"Yuki Fashion" <${process.env.MAIL_USER}>`,
    to: email,
    subject: 'Khôi phục mật khẩu - Yuki Fashion',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
        <h2 style="color: #333; text-align: center;">YUKI FASHION</h2>
        <p>Chào bạn,</p>
        <p>Chúng tôi nhận được yêu cầu khôi phục mật khẩu cho tài khoản của bạn tại <strong>Yuki Fashion</strong>.</p>
        <p>Vui lòng nhấn vào nút bên dưới để tiến hành đặt lại mật khẩu. Đường dẫn này sẽ hết hạn sau 15 phút.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #000; color: #fff; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Đặt lại mật khẩu</a>
        </div>
        <p>Nếu bạn không yêu cầu thay đổi mật khẩu, vui lòng bỏ qua email này.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #888; text-align: center;">Đây là email tự động, vui lòng không phản hồi.</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};
