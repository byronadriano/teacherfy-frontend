import hyperdiv as hd


def main():
    # Define state variables
    state = hd.state(
        lesson_topic="",
        district="",
        grade_level="",
        subject_focus="",
        custom_prompt="",
        num_slides="3",  # Store as a string to handle text input
        message="",
    )

    # Backend API URL
    API_URL = "http://teacherfy-gma6hncme7cpghda.westus-01.azurewebsites.net/generate"

    def generate_presentation():
        try:
            # Validate num_slides
            if not state.num_slides.isdigit() or not (1 <= int(state.num_slides) <= 10):
                state.message = "Number of slides must be a number between 1 and 10."
                return

            # Prepare the payload for the backend API
            payload = {
                "lesson_topic": state.lesson_topic,
                "district": state.district,
                "grade_level": state.grade_level,
                "subject_focus": state.subject_focus,
                "custom_prompt": state.custom_prompt,
                "num_slides": int(state.num_slides),  # Convert to integer
            }

            # Call the backend API
            response = hd.http.post(API_URL, json=payload)
            if response.status_code == 200:
                state.message = "Presentation generated successfully! Check your downloads."
                # Save the file locally
                with open(f"{state.lesson_topic}_lesson.pptx", "wb") as f:
                    f.write(response.content)
            else:
                state.message = f"Error: {response.json().get('error', 'Unknown error')}"
        except Exception as e:
            state.message = f"Exception occurred: {str(e)}"

    # Define the app layout
    template = hd.template(title="Teacherfy.ai - Lesson Generator", sidebar=False)

    # Render the app UI
    with template.body:
        # Header
        with hd.box(
            align="center",
            padding=1,
            gap=0.5,
            background_color="neutral-50",
            border_radius="medium",
        ):
            # hd.markdown("## Teacherfy.ai - Lesson Generator")
            # Replace the markdown with an image
            hd.image(
                src="assets/Teacherfyoai.png",
                width="300px"  # Adjust the width as needed
            )
        # Input Form
        with hd.form(gap=1):
            # Input fields with default values
            topic_input = hd.text_input(
                placeholder="Enter lesson topic",
                value=state.lesson_topic,
                name="lesson_topic",
            )
            if topic_input.changed:
                state.lesson_topic = topic_input.value

            district_input = hd.text_input(
                placeholder="Enter district",
                value=state.district,
                name="district",
            )
            if district_input.changed:
                state.district = district_input.value

            grade_input = hd.text_input(
                placeholder="Enter grade level",
                value=state.grade_level,
                name="grade_level",
            )
            if grade_input.changed:
                state.grade_level = grade_input.value

            subject_input = hd.text_input(
                placeholder="Enter subject focus",
                value=state.subject_focus,
                name="subject_focus",
            )
            if subject_input.changed:
                state.subject_focus = subject_input.value

            prompt_input = hd.textarea(
                placeholder="Add specific instructions or details (optional)",
                value=state.custom_prompt,
                name="custom_prompt",
            )
            if prompt_input.changed:
                state.custom_prompt = prompt_input.value

            slides_input = hd.text_input(
                placeholder="Number of slides (1-10)",
                value=state.num_slides,
                name="num_slides",
            )
            if slides_input.changed:
                state.num_slides = slides_input.value

        # Generate Button
        generate_button = hd.button("Generate Presentation", variant="primary")
        if generate_button.clicked:
            generate_presentation()

        # Show Message
        if state.message:
            hd.text(
                state.message,
                font_color="success" if "successfully" in state.message else "danger",
            )


# Run the Hyperdiv app
if __name__ == "__main__":
    hd.run(main)
