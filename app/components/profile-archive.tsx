import Image from "next/image";
import type { ProfileData } from "@/lib/profile-data";

export default function ProfileArchive({
  profile,
  secret,
  onContinue,
}: {
  profile: ProfileData;
  secret: boolean;
  onContinue: () => void;
}) {
  return (
    <section className="profile-archive" aria-labelledby="archive-title">
      <div className="archive-heading">
        <div>
          <p>PROFILE DATABASE <span>/ ACCESS GRANTED</span></p>
          <h1 id="archive-title">{profile.fullName}</h1>
          <span className="archive-program">{profile.program}</span>
        </div>
        <span className="archive-stamp" aria-label="Access granted">OPEN<br />FILE</span>
      </div>

      <div className="archive-content">
        <figure className="archive-character">
          <Image
            src="/profile.jpg"
            alt="The girl who shared Christian's profile"
            width={720}
            height={720}
            sizes="(max-width: 680px) 36vw, 230px"
          />
          <figcaption>The girl <span>STILL HERE</span></figcaption>
          <p>
            {secret
              ? "You asked about the person beside you, too."
              : "Don't get the wrong idea. You're a friend now."}
          </p>
        </figure>

        <div className="archive-record">
          <section className="archive-section">
            <h2>ABOUT</h2>
            <p>{profile.about}</p>
          </section>

          <section className="archive-section">
            <h2>INTERESTS</h2>
            <div className="archive-tags">
              {profile.interests.map((interest) => (
                <span key={interest.id}>{interest.label}</span>
              ))}
            </div>
          </section>

          <section className="archive-section">
            <h2>SKILLS</h2>
            <div className="archive-skills">
              {profile.skills.map((skill) => (
                <div className="archive-skill" key={skill.id}>
                  <div><span>{skill.name}</span><strong>{skill.mastery}%</strong></div>
                  <span className="archive-skill-track">
                    <i style={{ width: `${skill.mastery}%` }} />
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="archive-section archive-projects">
            <h2>PROJECTS</h2>
            {profile.projects.map((project) => (
              <article key={project.id}>
                <div>
                  <strong>{project.name}</strong>
                  <span>{project.status}</span>
                </div>
                <p>{project.technologies.map((technology) => technology.name).join(" · ")}</p>
              </article>
            ))}
          </section>

          <section className="archive-section">
            <h2>CONTACT CATEGORIES</h2>
            <div className="archive-tags">
              {profile.socialLinks.map((contact) => (
                <span key={contact.id}>{contact.label}</span>
              ))}
            </div>
          </section>
        </div>
      </div>

      <div className="archive-footer">
        <p>{secret ? "A LITTLE MORE THAN A FILE, THEN." : "I'M ONLY SHOWING YOU BECAUSE YOU'RE MY FRIEND NOW."}</p>
        <button className="continue-button" type="button" onClick={onContinue}>
          <span>FINISH STORY</span>
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  );
}
